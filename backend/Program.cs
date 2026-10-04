using backend.Auth;
using backend.Data;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

var builder = WebApplication.CreateBuilder(args);

// The URL path prefix this app is served under: "" for the domain root,
// "/sanguumat" behind a reverse proxy that mounts it there. Set it with
// App__BasePath (APP_BASE_PATH in deploy/.env).
//
// Read at startup rather than baked into the image: together with Vite's
// relative asset base and the <base href> injected into index.html below, moving
// the app to a different path is a config change plus `docker compose up -d`,
// with no rebuild. Normalised here to "" or "/prefix" with no trailing slash.
var basePath = (builder.Configuration["App:BasePath"] ?? string.Empty).Trim().Trim('/');
basePath = basePath.Length == 0 ? string.Empty : "/" + basePath;

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi

//Controller API
builder.Services.AddControllers();

//Swagger /OpenAPI
builder.Services.AddOpenApi();

// PostgreSQL
builder.Services.AddScoped<backend.Notifications.Notifier>();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        // The API container can come up before Postgres finishes accepting
        // connections, and a self-hosted box drops connections on restart. Retry
        // transient failures instead of surfacing a 500.
        npgsql => npgsql.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorCodesToAdd: null)));

// The app runs behind a reverse proxy that terminates TLS and forwards plain
// HTTP to the container with X-Forwarded-Proto: https. Without this the app thinks
// every request is http://, builds the Google redirect_uri as http, and refuses to
// set the Secure cookie.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

// The UI is a static site on another origin, so the browser needs CORS to call this API.
// Authentication is a bearer token in the Authorization header, not a cookie, so
// credentials are not allowed or needed.
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?.Where(origin => !string.IsNullOrWhiteSpace(origin)).ToArray()
    ?? ["http://localhost:3000"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

// Authentication: callers prove who they are with a JWT (Authorization: Bearer). Google
// sign-in only runs once, at /api/auth/login: its result is parked in a short-lived
// "External" cookie, then /api/auth/token turns it into a JWT and redirects to the UI.
var jwtKey = TokenService.GetKey(builder.Configuration);
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // Keep claim names exactly as TokenService wrote them (ClaimTypes URIs), so the
    // controllers read the same claims the cookie session used to carry.
    options.MapInboundClaims = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = jwtKey,
        ValidIssuer = TokenService.Issuer,
        ValidAudience = TokenService.Audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromMinutes(1),
        NameClaimType = System.Security.Claims.ClaimTypes.Name,
        RoleClaimType = System.Security.Claims.ClaimTypes.Role
    };
})
.AddCookie(TokenService.ExternalScheme, options =>
{
    // Only holds the Google result for the few seconds between Google's callback and
    // /api/auth/token. Lax lets it survive Google's top-level redirect back to us.
    options.Cookie.Name = "sangu.external";
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
        ? CookieSecurePolicy.SameAsRequest
        : CookieSecurePolicy.Always;
    options.ExpireTimeSpan = TimeSpan.FromMinutes(5);
})
.AddGoogle(options =>
{
    options.SignInScheme = TokenService.ExternalScheme;
    options.ClientId = builder.Configuration["Authentication:Google:ClientId"]
        ?? throw new InvalidOperationException("Authentication:Google:ClientId is not configured.");
    options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]
        ?? throw new InvalidOperationException("Authentication:Google:ClientSecret is not configured.");
});

// Local-only stand-in for Google (dev/mock-google/server.mjs), so the UI can be signed
// into as any seeded user without real Google accounts. Registered only in Development
// and only when DevAuth:MockGoogleUrl is set; AuthController.Login falls back to real
// Google whenever the mock is not answering, so stopping the mock is all it takes to
// switch back. It reuses the Google handler, so the cookie carries exactly the claims a
// real Google login would.
var mockGoogleUrl = builder.Configuration["DevAuth:MockGoogleUrl"]?.TrimEnd('/');
if (builder.Environment.IsDevelopment() && !string.IsNullOrWhiteSpace(mockGoogleUrl))
{
    builder.Services.AddAuthentication().AddGoogle(DevAuth.MockGoogleScheme, "Mock Google", options =>
    {
        options.SignInScheme = TokenService.ExternalScheme;
        options.ClientId = "mock-client";
        options.ClientSecret = "mock-secret";
        options.CallbackPath = "/signin-mock-google";
        options.AuthorizationEndpoint = mockGoogleUrl + "/o/oauth2/v2/auth";
        options.TokenEndpoint = mockGoogleUrl + "/token";
        options.UserInformationEndpoint = mockGoogleUrl + "/userinfo";
    });
    builder.Services.AddHttpClient(DevAuth.MockGoogleScheme, client =>
    {
        client.BaseAddress = new Uri(mockGoogleUrl + "/");
        client.Timeout = TimeSpan.FromMilliseconds(500);
    });
}



var app = builder.Build();

// Strips the prefix off the incoming path and records it as Request.PathBase, so
// controller routes stay prefix-free while every generated URL — the Google
// redirect_uri above all — comes back out with the prefix on the front.
//
// This MUST run before UseRouting (called explicitly further down), because route
// matching happens against the path as it stands at that point. Leaving routing
// implicit puts it at the very top of the pipeline, ahead of this, and then every
// controller 404s under the prefix while the SPA fallback quietly answers instead.
if (basePath.Length > 0)
{
    app.UsePathBase(basePath);
}

app.UseForwardedHeaders();

// Apply pending EF migrations on boot so a freshly created Postgres volume comes
// up with a usable schema.
using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseHttpsRedirection();
}

// wwwroot holds two things: uploads/ (profile pictures and article covers, a mounted volume) and the
// built React bundle, which the Docker build drops in next to it. Serving both
// from here is what puts the SPA and the API on one origin.
app.UseDefaultFiles();
app.UseStaticFiles();

// Explicit, so that WebApplication does not insert its own copy at the top of the
// pipeline ahead of UsePathBase above.
app.UseRouting();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/healthz", () => Results.Ok("OK"));

// React Router owns the client-side routes, so a hard refresh on /pertanyaan has
// to come back as index.html rather than a 404. Only mapped when the bundle is
// actually present — running the API alone (dev, `dotnet run`) has no wwwroot
// index.html and should keep returning real 404s.
var spaIndexPath = Path.Combine(app.Environment.WebRootPath ?? string.Empty, "index.html");
if (File.Exists(spaIndexPath))
{
    // The bundle references its assets relatively ("./assets/x.js"), so the
    // browser needs a <base href> to resolve them against — and it has to be the
    // mount prefix, not the current route, or a deep link like
    // /sanguumat/questions would look for /sanguumat/questions/assets/x.js.
    //
    // Any <base> Vite emitted is replaced, and the tag is put immediately after
    // <head> so it precedes every relative URL. Built once, not per request.
    var spaIndexHtml = new Lazy<string>(() =>
    {
        var html = File.ReadAllText(spaIndexPath);
        html = Regex.Replace(html, @"<base\b[^>]*>", string.Empty, RegexOptions.IgnoreCase);
        return Regex.Replace(
            html,
            @"<head\b[^>]*>",
            match => match.Value + $"\n    <base href=\"{basePath}/\" />",
            RegexOptions.IgnoreCase);
    });

    app.MapFallback(async context =>
    {
        // Unknown /api paths are API mistakes, not SPA routes — handing them an
        // HTML page would turn a 404 into a confusing JSON parse error.
        if (context.Request.Path.StartsWithSegments("/api"))
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            return;
        }

        context.Response.ContentType = "text/html; charset=utf-8";
        await context.Response.WriteAsync(spaIndexHtml.Value);
    });
}

app.Run();

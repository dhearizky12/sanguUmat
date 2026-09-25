using backend.Data;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
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

// The app runs behind Tailscale Funnel, which terminates TLS and forwards plain
// HTTP to the container with X-Forwarded-Proto: https. Without this the app thinks
// every request is http://, builds the Google redirect_uri as http, and refuses to
// set the Secure cookie.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

// CORS is only needed when the SPA is served from somewhere other than this app
// — i.e. `npm run dev` on localhost:3000. In the deployed setup the bundle comes
// out of wwwroot on this same origin and no request is cross-origin at all.
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
                .AllowAnyMethod()
                .AllowCredentials();
        });
});

//Authentication Google
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
})
.AddCookie(options =>
{
    // In production the SPA is served out of this app's own wwwroot, so it and the
    // API share one origin (the Funnel hostname) and the cookie is first-party. Lax is
    // therefore the right default: every browser accepts it — including Firefox and
    // Safari, which block the third-party cookie SameSite=None would need — and it
    // closes the CSRF hole None leaves open. Google's callback is a top-level GET,
    // so Lax still lets the login redirect through.
    //
    // Override with Authentication__CookieSameSite=None only if the SPA ever moves
    // back to a separate host.
    if (!builder.Environment.IsDevelopment())
    {
        options.Cookie.SameSite =
            Enum.TryParse<SameSiteMode>(builder.Configuration["Authentication:CookieSameSite"], ignoreCase: true, out var sameSite)
                ? sameSite
                : SameSiteMode.Lax;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;

        // Only for sibling subdomains sharing a registrable domain. Not needed on a
        // single origin — leave unset.
        var cookieDomain = builder.Configuration["Authentication:CookieDomain"];
        if (!string.IsNullOrWhiteSpace(cookieDomain))
        {
            options.Cookie.Domain = cookieDomain;
        }
    }
})
.AddGoogle(options =>
{
    options.ClientId = builder.Configuration["Authentication:Google:ClientId"]
        ?? throw new InvalidOperationException("Authentication:Google:ClientId is not configured.");
    options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]
        ?? throw new InvalidOperationException("Authentication:Google:ClientSecret is not configured.");
});



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

// wwwroot holds two things: uploads/ (profile pictures, a mounted volume) and the
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

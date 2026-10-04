using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Extensions;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend.DTOs;
using backend.Accounts;
using backend.Auth;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : Controller
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _config;
        private readonly string _frontendBaseUrl;

        public AuthController(AppDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
            _frontendBaseUrl = (config["Frontend:BaseUrl"] ?? "http://localhost:3000").TrimEnd('/');
        }

        [HttpGet("login")]
        public async Task<IActionResult> Login([FromQuery] string? returnUrl)
        {
            // After Google, /api/auth/token issues the JWT and sends the visitor to the
            // frontend's /masuk/selesai, which decides where to go: the profile form for
            // an incomplete profile, otherwise the page the visitor came from.
            var next = IsLocalPath(returnUrl) ? returnUrl! : "/";
            return Challenge(
                new AuthenticationProperties
                {
                    // Back to this API's token step, which hands the UI its JWT.
                    RedirectUri = Url.Content("~/api/auth/token") + "?next=" + Uri.EscapeDataString(next)
                },
                await IsMockGoogleUpAsync() ? DevAuth.MockGoogleScheme : GoogleDefaults.AuthenticationScheme
            );
        }

        // Google just signed the visitor in (the short-lived External cookie holds the
        // result). Turn it into the bearer token and hand it to the UI in the URL
        // fragment, which no server or log ever sees.
        [HttpGet("token")]
        public async Task<IActionResult> Token([FromQuery] string? next)
        {
            var external = await HttpContext.AuthenticateAsync(TokenService.ExternalScheme);
            if (!external.Succeeded || external.Principal == null)
            {
                return Redirect(_frontendBaseUrl + "/login");
            }

            // A real Google sign-in by someone whose account was deleted starts over as a new user:
            // free the Google id the deleted account kept, so /me can create the new one.
            var googleId = external.Principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var deleted = await _db.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId && u.DeletedAt != null);
            if (deleted != null)
            {
                deleted.GoogleId = $"deleted:{deleted.Id}";
                await _db.SaveChangesAsync();
            }

            var token = TokenService.Issue(_config, external.Principal);
            await HttpContext.SignOutAsync(TokenService.ExternalScheme);

            var safeNext = IsLocalPath(next) ? next! : "/";
            return Redirect(_frontendBaseUrl + "/masuk/selesai?next=" + Uri.EscapeDataString(safeNext) + "#token=" + token);
        }

        // Only a path within the app — one leading "/", not "//" or "/\" (both of which
        // browsers read as another host) — so returnUrl cannot become an open redirect.
        private static bool IsLocalPath(string? path) =>
            !string.IsNullOrEmpty(path)
            && path[0] == '/'
            && (path.Length == 1 || (path[1] != '/' && path[1] != '\\'));

        // The mock Google scheme only exists in Development with DevAuth:MockGoogleUrl set
        // (see Program.cs). Even then it is used only while the mock server answers, so
        // stopping dev/mock-google/server.mjs sends login back to real Google.
        private async Task<bool> IsMockGoogleUpAsync()
        {
            var schemes = HttpContext.RequestServices.GetRequiredService<IAuthenticationSchemeProvider>();
            if (await schemes.GetSchemeAsync(DevAuth.MockGoogleScheme) == null)
            {
                return false;
            }

            try
            {
                var client = HttpContext.RequestServices
                    .GetRequiredService<IHttpClientFactory>()
                    .CreateClient(DevAuth.MockGoogleScheme);
                using var response = await client.GetAsync("healthz");
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
            {
                return false;
            }
        }

        [HttpGet("me")]
        public async Task <IActionResult> Me()
        {
            if (User.Identity?.IsAuthenticated == true)
            {
                var googleId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var email = User.FindFirst(ClaimTypes.Email)?.Value;
                var name = User.FindFirst(ClaimTypes.Name)?.Value;
                var picture = User.FindFirst("picture")?.Value;
                var existingUser = await this.GetCurrentUserAsync(_db);

                // A token issued before the account was deleted: signed out, and no new account.
                if (existingUser == null && await _db.Users.AnyAsync(u => u.GoogleId == googleId && u.DeletedAt != null))
                {
                    return Ok(new { isAuthenticated = false });
                }

                if (existingUser == null)
                {
                    // Solves the chicken-and-egg problem of getting a first Admin without
                    // touching the DB by hand — see AdminEmails in appsettings.json.
                    var adminEmails = _config.GetSection("AdminEmails").Get<string[]>() ?? Array.Empty<string>();
                    var isBootstrapAdmin = email != null && adminEmails.Any(x => x.Equals(email, StringComparison.OrdinalIgnoreCase));

                    var user = new User
                    {
                        GoogleId = googleId,
                        Email = email,
                        Name = name,
                        Picture = picture,
                        Role = isBootstrapAdmin ? Roles.Admin : Roles.User,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        LastLogin = DateTime.UtcNow
                    };
                    user.HasCompletedProfile = user.IsProfileComplete();
                    _db.Users.Add(user);
                    existingUser = user;
                }
                else
                {
                    existingUser.LastLogin = DateTime.UtcNow;
                    // Re-evaluated on every visit so accounts created under the earlier
                    // phone-and-address rule are corrected without a data migration.
                    existingUser.HasCompletedProfile = existingUser.IsProfileComplete();
                }

                await _db.SaveChangesAsync();
                return Ok( new
                {
                    isAuthenticated = true,
                    Id = existingUser.Id,
                    name = existingUser.Name,
                    email = existingUser.Email,
                    picture = existingUser.Picture,
                    role = existingUser.Role,
                    isUstadz = UstadzRules.IsUstadz(existingUser),
                    hasCompletedProfile = existingUser.HasCompletedProfile
                });
            }
            
            return Ok(new
            {
                isAuthenticated = false
            });
        }

        [HttpPost("complete-profile")]
        public async Task<IActionResult> CompleteProfile ([FromBody] ComppleteProfileRequest request)
        {
            var user = await this.GetCurrentUserAsync(_db);

            if ( user == null )
            {
                return BadRequest();
            }

            // Only the name is required; phone and address are optional.
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest("Nama harus diisi");
            }

            user.Name = request.Name;
            user.Phone = request.Phone;
            user.Address = request.Address;
            user.UpdatedAt = DateTime.UtcNow;
            user.HasCompletedProfile = user.IsProfileComplete();

            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("profile")]
        public async Task<IActionResult> Profile()
        {
            var user = await this.GetCurrentUserAsync(_db);

            if( user == null )
            {
                return NotFound();
            }

            return Ok( new
            {
                user.Id,
                user.Name,
                user.Email,
                user.Picture,
                user.Phone,
                user.Address,
                user.Role,
                IsUstadz = UstadzRules.IsUstadz(user),
                user.CreatedAt,
                user.LastLogin
            });
        }

        // Delete your own account (specs/account-deletion). An Admin cannot, so there is always
        // someone left to administer; another Admin demotes them first.
        [HttpDelete("account")]
        public async Task<IActionResult> DeleteAccount()
        {
            var user = await this.GetCurrentUserAsync(_db);
            if (user == null)
            {
                return Unauthorized();
            }

            if (user.Role == Roles.Admin)
            {
                return BadRequest("Admin tidak dapat menghapus akunnya sendiri. Minta Admin lain menurunkan perannya lebih dulu.");
            }

            await AccountDeleter.DeleteAsync(_db, user);
            return NoContent();
        }

        [HttpPost("upload-picture")]
        public async Task<IActionResult>UploadPicture (IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("Berkas kosong");
            }

            var user = await this.GetCurrentUserAsync(_db);

            if ( user == null )
            {
                return Unauthorized();
            }

            var uploadsFolder = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                "uploads"   
            );

            if(!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var extension = Path.GetExtension(file.FileName);

            var fileName = Guid.NewGuid().ToString() + extension;

            var filePath = Path.Combine(uploadsFolder, fileName);

            using(var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            user.Picture = "/uploads/" + fileName;
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Ok(new
            {
                picture = user.Picture
            });
        }
    }
}
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.Cookies;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend.DTOs;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : Controller
    {
        private readonly AppDbContext _db;

        public AuthController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("login")]
        public IActionResult Login()
        {
            return Challenge(
                new AuthenticationProperties
                {
                    RedirectUri = "http://localhost:3000"
                },
                GoogleDefaults.AuthenticationScheme
            );
        }

        [HttpGet("me")]
        public async Task <IActionResult> Me()
        {
            if (User.Identity?.IsAuthenticated == true)
            {
                var googleId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var email = User.FindFirst(ClaimTypes.Email)?.Value;
                var name = User.FindFirst(ClaimTypes.Name)?.Value;
                var picture = User.FindFirst("Picture")?.Value;
                var existingUser = await _db.Users.FirstOrDefaultAsync(x=> x.GoogleId == googleId);

                if (existingUser == null)
                {
                    var user = new User
                    {
                        GoogleId = googleId,
                        Email = email,
                        Name = name,
                        Picture = picture,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        LastLogin = DateTime.UtcNow
                    };
                    _db.Users.Add(user);
                }
                else
                {
                    existingUser.LastLogin = DateTime.UtcNow;
                }

                await _db.SaveChangesAsync();
                return Ok( new
                {
                    isAuthenticated = true,
                    Name = name,
                    hasCompletedProfile = !string.IsNullOrEmpty(existingUser?.Phone)
                });
            }
            
            return Ok(new
            {
                isAuthenticated = false
            });
        }

        [HttpGet("logout")]
        public IActionResult Logout()
        {
            return SignOut(
                new AuthenticationProperties
                {
                    RedirectUri = "http://localhost:3000/login"
                },
                CookieAuthenticationDefaults.AuthenticationScheme
            );
        }

        [HttpPost("complete-profile")]
        public async Task<IActionResult> CompleteProfile ([FromBody] ComppleteProfileRequest request)
        {
            var googleId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _db.Users.FirstOrDefaultAsync(x => x.GoogleId == googleId);

            if ( user == null )
            {
                return BadRequest();
            }

            user.Phone = request.Phone;
            user.Address = request.Address;
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("profile")]
        public async Task<IActionResult> Profile()
        {
            var googleID = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _db.Users.FirstOrDefaultAsync( x => x.GoogleId == googleID);

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
                user.CreatedAt,
                user.LastLogin
            });
        }

        [HttpPost("upload-picture")]
        public async Task<IActionResult>UploadPicture (IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("File kosong");
            }

            var googleId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _db.Users.FirstOrDefaultAsync( x =>
                x.GoogleId == googleId);    

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
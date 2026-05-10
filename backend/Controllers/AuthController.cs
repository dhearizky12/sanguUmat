using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : Controller
    {
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
        public IActionResult Me()
        {
            if (User.Identity?.IsAuthenticated == true)
            {
                return Ok( new
                {
                    isAuthenticated = true,
                    name = User.Identity.Name
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
    }
}
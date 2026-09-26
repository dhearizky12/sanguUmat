using backend.Data;
using backend.Models;
using backend.Queries;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    // The numbers Beranda's hero shows. Published questions only, so a private answer is
    // never counted and never makes the site look "updated".
    [ApiController]
    [Route("api/home")]
    public class HomeController : Controller
    {
        private readonly AppDbContext _db;

        public HomeController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> Summary()
        {
            var published = _db.Questions.Published();
            return Ok(new
            {
                publishedAnswers = await published.CountAsync(),
                ustadz = await _db.Users.CountAsync(u => u.Role == Roles.Guru),
                lastAnsweredAt = await published.SelectMany(q => q.Answers)
                    .MaxAsync(a => (DateTime?)a.CreatedAt)
            });
        }
    }
}

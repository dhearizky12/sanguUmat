using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuestionController : Controller
    {
        private readonly AppDbContext _db;

        public QuestionController(AppDbContext db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> CreateQuestion ([FromBody] CreateQuestionRequest request)
        {
            var googleId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _db.Users.FirstOrDefaultAsync(x => x.GoogleId == googleId);
            
            if (user == null)
            {
                return Unauthorized();
            }

            var question = new Question
            {
                Title = request.Title,
                Content = request.Content,
                CreatedAt = DateTime.UtcNow,
                UserId = user.Id
            };

            _db.Questions.Add(question);

            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetQuestions()
        {
            var questions = 
                await _db.Questions
                .Include( x=> x.User)
                .OrderByDescending(x => x.CreatedAt)
                .Select( x => new
                {
                    x.Id,
                    x.Title,
                    x.Content,
                    x.CreatedAt,
                    UserName = x.User.Name,
                    UserPicture = x.User.Picture
                })
                .ToListAsync();

            return Ok(questions);      
        }
    }
}
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
        public async Task<IActionResult> GetQuestions([FromQuery] string? search)
        {
            var query = _db.Questions.Include
                        (x => x.User)
                        .AsQueryable();

            //Search Logic
            if( !string.IsNullOrWhiteSpace(search))
            {
                query = query.Where( x => x.Title.ToLower().Contains(search.ToLower()) 
                    ||
                    x.Content.ToLower().Contains(search.ToLower())
                );
            }

            var questions = await query.OrderByDescending( x => x.CreatedAt )
                            .Select( x => new 
                            {
                                x.Id,
                                x.Title,
                                x.Content,
                                x.CreatedAt,
                                UserId = x.User.Id,
                                UserName = x.User.Name,
                                UserPicture = x.User.Picture
                            })
                            .ToListAsync();

            return Ok(questions);      
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDetailQuestion(int id)
        {
            var question =
                await _db.Questions
                    .Include(x => x.User)

                    .Include(x => x.Answers)
                    .ThenInclude(x => x.User)

                    .FirstOrDefaultAsync(x =>
                        x.Id == id);

            if (question == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                question.Id,
                question.Title,
                question.Content,

                UserName =
                    question.User.Name,

                UserPicture =
                    question.User.Picture,

                Answers =
                    question.Answers
                        .OrderByDescending(x =>
                            x.CreatedAt)
                        .Select(x => new
                        {
                            x.Id,
                            x.Content,
                            x.CreatedAt,

                            UserName =
                                x.User.Name,

                            UserPicture =
                                x.User.Picture
                        })
            });
        }
    }
}
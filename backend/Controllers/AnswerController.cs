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
    public class AnswerController : Controller
    {
        private readonly AppDbContext _db;

        public AnswerController(AppDbContext db)
        {
            _db = db;
        }

        [HttpPost("{questionId}")]
        public async Task<IActionResult> CreateAnswer(
            int questionId,
            [FromBody] CreateAnswerRequest request)
        {
            var googleId =
                User.FindFirst(
                    ClaimTypes.NameIdentifier
                )?.Value;

            var user =
                await _db.Users
                    .FirstOrDefaultAsync(x =>
                        x.GoogleId == googleId);

            if (user == null)
            {
                return Unauthorized();
            }

            // HANYA GURU
            if (user.Role != "Guru")
            {
                return Forbid();
            }

            var question =
                await _db.Questions
                    .FirstOrDefaultAsync(x =>
                        x.Id == questionId);

            if (question == null)
            {
                return NotFound();
            }

            var answer = new Answer
            {
                Content = request.Content,

                CreatedAt =
                    DateTime.UtcNow,

                QuestionId = question.Id,

                UserId = user.Id
            };

            _db.Answers.Add(answer);

            await _db.SaveChangesAsync();

            return Ok();
        }
    }
}
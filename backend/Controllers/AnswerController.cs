using backend.Data;
using backend.DTOs;
using backend.Extensions;
using backend.Models;
using backend.Queries;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
            var user = await this.GetCurrentUserAsync(_db);

            if (user == null)
            {
                return Unauthorized();
            }

            // HANYA GURU
            if (user.Role != Roles.Guru)
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

        [HttpDelete("{answerId}")]
        public async Task<IActionResult>DeleteAnswer( int answerId )
        {
            var user = await this.GetCurrentUserAsync(_db);
            if ( user == null )
            {
                return Unauthorized();
            }

            var answer = await _db.Answers.FirstOrDefaultAsync( x => x.Id == answerId );

            if ( answer == null )
            {
                return NotFound();
            }

            //hanya pemilik jawaban atau admin yang bisa hapus

            if( answer.UserId != user.Id && user.Role != Roles.Admin )
            {
                return Forbid();
            }

            _db.Answers.Remove(answer);
            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("{answerId}")]
        public async Task<IActionResult> UpdateAnswer(int answerId, [FromBody] UpdateAnswerRequest request)
        {
            var user = await this.GetCurrentUserAsync(_db);
            if (user == null)
            {
                return Unauthorized();
            }

            var answer = await _db.Answers.FirstOrDefaultAsync(x => x.Id == answerId);

            if (answer == null)
            {
                return NotFound();
            }

            //hanya pemilik jawaban atau admin yang bisa edit
            if (answer.UserId != user.Id && user.Role != Roles.Admin)
            {
                return Forbid();
            }

            answer.Content = request.Content;
            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("{answerId}/comments")]
        public async Task<IActionResult> GetComments(int answerId)
        {
            // Comments follow their question: a private answer's discussion is as hidden as
            // the answer, and an anonymous asker's own comments are masked like the question.
            var viewer = await this.GetCurrentUserAsync(_db);
            var question = await QuestionOfAsync(answerId);
            if (question == null || !QuestionVisibility.CanSee(question, viewer))
            {
                return NotFound();
            }
            var maskAsker = question.IsAnonymous && !QuestionVisibility.SeesAsker(question.UserId, viewer);

            var comments = await _db.Comments
                .Where(x => x.AnswerId == answerId)
                .Include(x => x.User)
                .OrderBy(x => x.CreatedAt)
                .Select(x => new
                {
                    x.Id,
                    x.Content,
                    x.CreatedAt,
                    UserId = x.UserId,
                    UserName = x.User.Name,
                    UserPicture = x.User.Picture
                })
                .ToListAsync();

            return Ok(comments.Select(c => maskAsker && c.UserId == question.UserId
                ? new { c.Id, c.Content, c.CreatedAt, UserId = (int?)null, UserName = QuestionVisibility.AnonymousName, UserPicture = (string?)null }
                : new { c.Id, c.Content, c.CreatedAt, UserId = (int?)c.UserId, c.UserName, c.UserPicture }));
        }

        [HttpPost("{answerId}/comments")]
        public async Task<IActionResult> CreateComment(int answerId, [FromBody] CreateCommentRequest request)
        {
            var user = await this.GetCurrentUserAsync(_db);

            if (user == null)
            {
                return Unauthorized();
            }

            var question = await QuestionOfAsync(answerId);

            if (question == null || !QuestionVisibility.CanSee(question, user))
            {
                return NotFound();
            }

            var comment = new Comment
            {
                Content = request.Content,
                CreatedAt = DateTime.UtcNow,
                AnswerId = answerId,
                UserId = user.Id
            };

            _db.Comments.Add(comment);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                comment.Id,
                comment.Content,
                comment.CreatedAt,
                UserId = user.Id,
                UserName = user.Name,
                UserPicture = user.Picture
            });
        }

        [HttpDelete("{answerId}/comments/{commentId}")]
        public async Task<IActionResult> DeleteComment(int answerId, int commentId)
        {
            var user = await this.GetCurrentUserAsync(_db);

            if (user == null)
            {
                return Unauthorized();
            }

            var comment = await _db.Comments.FirstOrDefaultAsync(x => x.Id == commentId && x.AnswerId == answerId);

            if (comment == null)
            {
                return NotFound();
            }

            //hanya pemilik komentar atau admin yang bisa hapus
            if (comment.UserId != user.Id && user.Role != Roles.Admin)
            {
                return Forbid();
            }

            _db.Comments.Remove(comment);
            await _db.SaveChangesAsync();
            return Ok();
        }

        // The question an answer belongs to, with its answers loaded for CanSee.
        private Task<Question?> QuestionOfAsync(int answerId) =>
            _db.Questions.Include(q => q.Answers)
                .FirstOrDefaultAsync(q => q.Answers.Any(a => a.Id == answerId));
    }
}

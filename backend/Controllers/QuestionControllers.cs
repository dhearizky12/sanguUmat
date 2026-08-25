using backend.Data;
using backend.DTOs;
using backend.Extensions;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
            var user = await this.GetCurrentUserAsync(_db);

            if (user == null)
            {
                return Unauthorized();
            }

            // Null/unrecognized category is allowed through as "uncategorized" (renders as
            // "Lainnya" on the FE) rather than rejected -- Category is a nice-to-have tag, not
            // a required field.
            var category = request.Category != null && Categories.All.Contains(request.Category)
                ? request.Category
                : null;

            var question = new Question
            {
                Title = request.Title,
                Content = request.Content,
                Category = category,
                CreatedAt = DateTime.UtcNow,
                UserId = user.Id
            };

            _db.Questions.Add(question);

            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetQuestions([FromQuery] string? search, [FromQuery] string? status, [FromQuery] string? category)
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

            if (status == "answered")
            {
                query = query.Where(x => x.Answers.Any());
            }
            else if (status == "pending")
            {
                query = query.Where(x => !x.Answers.Any());
            }

            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(x => x.Category == category);
            }

            var questions = await query.OrderByDescending( x => x.CreatedAt )
                            .Select( x => new
                            {
                                x.Id,
                                x.Title,
                                x.Content,
                                x.CreatedAt,
                                x.Views,
                                x.Category,
                                UserId = x.User.Id,
                                UserName = x.User.Name,
                                UserPicture = x.User.Picture,
                                IsAnswered = x.Answers.Any(),
                                CommentCount = x.Answers.SelectMany(a => a.Comments).Count()
                            })
                            .ToListAsync();

            return Ok(questions);
        }

        // "mine" is a literal segment so it takes routing precedence over "{id}" below for
        // GET /api/question/mine — same response shape as GetQuestions, just pre-filtered.
        [HttpGet("mine")]
        public async Task<IActionResult> GetMyQuestions()
        {
            var user = await this.GetCurrentUserAsync(_db);

            if (user == null)
            {
                return Unauthorized();
            }

            var questions = await _db.Questions
                .Include(x => x.User)
                .Where(x => x.UserId == user.Id)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new
                {
                    x.Id,
                    x.Title,
                    x.Content,
                    x.CreatedAt,
                    x.Views,
                    x.Category,
                    UserId = x.User.Id,
                    UserName = x.User.Name,
                    UserPicture = x.User.Picture,
                    IsAnswered = x.Answers.Any(),
                    CommentCount = x.Answers.SelectMany(a => a.Comments).Count()
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

                    .Include(x => x.Answers)
                    .ThenInclude(x => x.Comments)

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
                question.CreatedAt,
                question.Views,
                question.Category,

                // Was missing entirely before — canEditQuestion/canDeleteQuestion on the FE
                // compare against this and silently never matched for the real owner.
                UserId = question.UserId,

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

                            UserId = x.UserId,

                            UserName =
                                x.User.Name,

                            UserPicture =
                                x.User.Picture,
                            Role = x.User.Role,
                            CommentCount = x.Comments.Count
                        })
            });
        }

        // Separate from GetDetailQuestion on purpose: that endpoint is also reused as a batch
        // data-fetch workaround by Dashboard.jsx/CreateQuestion.jsx/AnswerQueue.jsx (N+1
        // patterns, see FE_PLAN.md) — incrementing views there would count every dashboard
        // load, not real visits. Only DetailQuestion.jsx (the actual "viewing a question" page)
        // calls this, once per visit.
        [HttpPost("{id}/view")]
        public async Task<IActionResult> RecordView(int id)
        {
            var question = await _db.Questions.FirstOrDefaultAsync(x => x.Id == id);

            if (question == null)
            {
                return NotFound();
            }

            question.Views += 1;
            await _db.SaveChangesAsync();

            return Ok(new { question.Views });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateQuestion(int id, [FromBody] UpdateQuestionRequest request)
        {
            var user = await this.GetCurrentUserAsync(_db);

            if (user == null)
            {
                return Unauthorized();
            }

            var question = await _db.Questions
                .Include(x => x.Answers)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (question == null)
            {
                return NotFound();
            }

            // Hanya penulis pertanyaan yang bisa edit, dan hanya selama belum ada jawaban
            // (tidak seperti DeleteQuestion, tidak ada pengecualian untuk Admin di sini --
            // mengubah isi pertanyaan orang lain bukan tindakan moderasi yang wajar).
            if (question.UserId != user.Id)
            {
                return Forbid();
            }

            if (question.Answers.Any())
            {
                return Conflict();
            }

            question.Title = request.Title;
            question.Content = request.Content;
            await _db.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            var user = await this.GetCurrentUserAsync(_db);

            if (user == null)
            {
                return Unauthorized();
            }

            var question = await _db.Questions
                .Include(x => x.Answers)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (question == null)
            {
                return NotFound();
            }

            var isOwner = question.UserId == user.Id;
            var isAdmin = user.Role == Roles.Admin;

            // Owner bisa hapus hanya jika belum ada jawaban; Admin bisa hapus kapan saja
            // (moderasi tidak boleh terhalang aturan itu).
            if (!isOwner && !isAdmin)
            {
                return Forbid();
            }

            if (isOwner && !isAdmin && question.Answers.Any())
            {
                return Conflict();
            }

            _db.Questions.Remove(question);
            await _db.SaveChangesAsync();
            return Ok();
        }
    }
}
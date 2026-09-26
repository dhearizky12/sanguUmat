using backend.Data;
using backend.Extensions;
using backend.Kajians;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    // Panel Admin's read-only views of the whole site: the overview, and every question,
    // comment, article and kajian, 20 a page. Admins see the truth here — no anonymous
    // masking, no consent filter. Deleting goes through the existing endpoints and rules.
    [ApiController]
    [Route("api/admin")]
    public class AdminContentController : Controller
    {
        private const int PageSize = 20;
        private readonly AppDbContext _db;

        public AdminContentController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("overview")]
        public async Task<IActionResult> Overview()
        {
            var denied = await RequireAdminAsync();
            if (denied != null) return denied;

            var now = DateTime.UtcNow;
            var week = now.AddDays(-7);
            var waiting = await _db.Questions.Where(q => !q.Answers.Any())
                .OrderBy(q => q.CreatedAt).Take(5)
                .Select(q => new
                {
                    id = q.Id,
                    title = q.Title,
                    createdAt = q.CreatedAt,
                    directedTo = q.DirectedTo == null ? null : new { id = q.DirectedTo.Id, name = q.DirectedTo.Name }
                })
                .ToListAsync();

            return Ok(new
            {
                users = new
                {
                    total = await _db.Users.CountAsync(),
                    anggota = await _db.Users.CountAsync(u => u.Role == Roles.User),
                    ustadz = await _db.Users.CountAsync(u => u.Role == Roles.Guru),
                    admin = await _db.Users.CountAsync(u => u.Role == Roles.Admin),
                    newThisWeek = await _db.Users.CountAsync(u => u.CreatedAt >= week)
                },
                questions = new
                {
                    total = await _db.Questions.CountAsync(),
                    published = await _db.Questions.CountAsync(q => q.AllowPublish && q.Answers.Any()),
                    waiting = await _db.Questions.CountAsync(q => !q.Answers.Any()),
                    privateAnswered = await _db.Questions.CountAsync(q => !q.AllowPublish && q.Answers.Any()),
                    anonymous = await _db.Questions.CountAsync(q => q.IsAnonymous)
                },
                activity = new
                {
                    questionsThisWeek = await _db.Questions.CountAsync(q => q.CreatedAt >= week),
                    answersThisWeek = await _db.Answers.CountAsync(a => a.CreatedAt >= week),
                    commentsThisWeek = await _db.Comments.CountAsync(c => c.CreatedAt >= week)
                },
                articles = new
                {
                    published = await _db.Articles.CountAsync(a => a.Status == ArticleStatus.Published),
                    drafts = await _db.Articles.CountAsync(a => a.Status == ArticleStatus.Draft)
                },
                kajian = new
                {
                    scheduled = await _db.Kajian.CountAsync(k => k.StartsAt > now),
                    live = await _db.Kajian.CountAsync(k => k.StartsAt <= now && k.StartsAt.AddMinutes(k.DurationMinutes) > now),
                    recorded = await _db.Kajian.CountAsync(k => k.StartsAt.AddMinutes(k.DurationMinutes) <= now)
                },
                waiting
            });
        }

        [HttpGet("questions")]
        public async Task<IActionResult> Questions([FromQuery] string? search, [FromQuery] string? status, [FromQuery] int page = 1)
        {
            var denied = await RequireAdminAsync();
            if (denied != null) return denied;

            var query = _db.Questions.AsQueryable();
            query = status switch
            {
                "menunggu" => query.Where(q => !q.Answers.Any()),
                "terjawab" => query.Where(q => q.AllowPublish && q.Answers.Any()),
                "privat" => query.Where(q => !q.AllowPublish && q.Answers.Any()),
                _ => query
            };
            if (Pattern(search) is string p)
            {
                query = query.Where(q => EF.Functions.ILike(q.Title, p) || EF.Functions.ILike(q.Content, p) || EF.Functions.ILike(q.User.Name, p));
            }

            return await PageAsync(query.OrderByDescending(q => q.CreatedAt).ThenByDescending(q => q.Id), page, q => new
            {
                id = q.Id,
                title = q.Title,
                createdAt = q.CreatedAt,
                category = q.Category == null ? null : new { key = q.Category.Key, name = q.Category.Name },
                asker = new { id = q.User.Id, name = q.User.Name },
                isAnonymous = q.IsAnonymous,
                allowPublish = q.AllowPublish,
                directedTo = q.DirectedTo == null ? null : new { id = q.DirectedTo.Id, name = q.DirectedTo.Name },
                answerCount = q.Answers.Count(),
                commentCount = q.Answers.SelectMany(a => a.Comments).Count()
            });
        }

        [HttpGet("comments")]
        public async Task<IActionResult> Comments([FromQuery] string? search, [FromQuery] int page = 1)
        {
            var denied = await RequireAdminAsync();
            if (denied != null) return denied;

            var query = _db.Comments.AsQueryable();
            if (Pattern(search) is string p)
            {
                query = query.Where(c => EF.Functions.ILike(c.Content, p) || EF.Functions.ILike(c.User.Name, p));
            }

            return await PageAsync(query.OrderByDescending(c => c.CreatedAt).ThenByDescending(c => c.Id), page, c => new
            {
                id = c.Id,
                content = c.Content,
                createdAt = c.CreatedAt,
                user = new { id = c.User.Id, name = c.User.Name },
                answerId = c.AnswerId,
                question = new { id = c.Answer.Question.Id, title = c.Answer.Question.Title }
            });
        }

        [HttpGet("articles")]
        public async Task<IActionResult> Articles([FromQuery] string? search, [FromQuery] string? status, [FromQuery] int page = 1)
        {
            var denied = await RequireAdminAsync();
            if (denied != null) return denied;

            var query = _db.Articles.AsQueryable();
            query = status switch
            {
                "draft" => query.Where(a => a.Status == ArticleStatus.Draft),
                "published" => query.Where(a => a.Status == ArticleStatus.Published),
                _ => query
            };
            if (Pattern(search) is string p)
            {
                query = query.Where(a => EF.Functions.ILike(a.Title, p) || EF.Functions.ILike(a.Author.Name, p));
            }

            return await PageAsync(query.OrderByDescending(a => a.UpdatedAt).ThenByDescending(a => a.Id), page, a => new
            {
                id = a.Id,
                title = a.Title,
                status = a.Status == ArticleStatus.Published ? "published" : "draft",
                author = new { id = a.Author.Id, name = a.Author.Name },
                category = a.Category == null ? null : new { key = a.Category.Key, name = a.Category.Name },
                updatedAt = a.UpdatedAt,
                publishedAt = a.PublishedAt,
                views = a.Views
            });
        }

        [HttpGet("kajian")]
        public async Task<IActionResult> Kajian([FromQuery] string? search, [FromQuery] string? status, [FromQuery] int page = 1)
        {
            var denied = await RequireAdminAsync();
            if (denied != null) return denied;

            var now = DateTime.UtcNow;
            var query = _db.Kajian.AsQueryable();
            query = status switch
            {
                KajianClock.Scheduled => query.Where(k => k.StartsAt > now),
                KajianClock.Live => query.Where(k => k.StartsAt <= now && k.StartsAt.AddMinutes(k.DurationMinutes) > now),
                KajianClock.Recorded => query.Where(k => k.StartsAt.AddMinutes(k.DurationMinutes) <= now),
                _ => query
            };
            if (Pattern(search) is string p)
            {
                query = query.Where(k => EF.Functions.ILike(k.Title, p) || EF.Functions.ILike(k.Series, p) || EF.Functions.ILike(k.Ustadz.Name, p));
            }

            var result = await PageRowsAsync(query.OrderByDescending(k => k.StartsAt).ThenByDescending(k => k.Id), page, k => new
            {
                k.Id, k.Title, k.Series, k.StartsAt, k.DurationMinutes, k.Views,
                HasNotes = k.NotesText != "",
                Ustadz = new { id = k.Ustadz.Id, name = k.Ustadz.Name }
            });
            return Ok(new
            {
                items = result.Items.Select(k => new
                {
                    id = k.Id,
                    title = k.Title,
                    series = k.Series,
                    status = KajianClock.StatusOf(k.StartsAt, k.DurationMinutes, now),
                    startsAt = k.StartsAt,
                    durationMinutes = k.DurationMinutes,
                    ustadz = k.Ustadz,
                    views = k.Views,
                    hasNotes = k.HasNotes
                }),
                total = result.Total,
                page = result.Page,
                totalPages = result.TotalPages
            });
        }

        private static string? Pattern(string? search)
        {
            var term = search?.Trim();
            if (string.IsNullOrEmpty(term)) return null;
            return "%" + term.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_") + "%";
        }

        private record Paged<T>(List<T> Items, int Total, int Page, int TotalPages);

        private static async Task<Paged<TOut>> PageRowsAsync<TIn, TOut>(IQueryable<TIn> ordered, int page, System.Linq.Expressions.Expression<Func<TIn, TOut>> select)
        {
            var total = await ordered.CountAsync();
            var totalPages = Math.Max(1, (int)Math.Ceiling(total / (double)PageSize));
            var current = Math.Clamp(page, 1, totalPages);
            var items = await ordered.Skip((current - 1) * PageSize).Take(PageSize).Select(select).ToListAsync();
            return new Paged<TOut>(items, total, current, totalPages);
        }

        private async Task<IActionResult> PageAsync<TIn, TOut>(IQueryable<TIn> ordered, int page, System.Linq.Expressions.Expression<Func<TIn, TOut>> select)
        {
            var r = await PageRowsAsync(ordered, page, select);
            return Ok(new { items = r.Items, total = r.Total, page = r.Page, totalPages = r.TotalPages });
        }

        private async Task<IActionResult?> RequireAdminAsync()
        {
            var user = await this.GetCurrentUserAsync(_db);
            if (user == null) return Unauthorized();
            if (user.Role != Roles.Admin) return StatusCode(StatusCodes.Status403Forbidden);
            return null;
        }
    }
}

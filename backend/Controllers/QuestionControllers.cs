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

            // A missing or unknown key is allowed through as uncategorised (the FE shows
            // "Lainnya") rather than rejected — the category is optional.
            var categoryId = string.IsNullOrWhiteSpace(request.Category)
                ? null
                : await _db.Categories
                    .Where(c => c.Key == request.Category)
                    .Select(c => (int?)c.Id)
                    .FirstOrDefaultAsync();

            var question = new Question
            {
                Title = request.Title,
                Content = request.Content,
                CategoryId = categoryId,
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

            // Only answered questions are published. Unanswered ones are listed only for the
            // people who answer them (Guru, Admin), and only when asked for explicitly.
            if (status == "pending")
            {
                var caller = await this.GetCurrentUserAsync(_db);
                if (!IsStaff(caller))
                {
                    return StatusCode(StatusCodes.Status403Forbidden);
                }
                query = query.Where(x => !x.Answers.Any());
            }
            else
            {
                query = query.Where(x => x.Answers.Any());
            }

            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(x => x.Category != null && x.Category.Key == category);
            }

            var questions = await query.OrderByDescending(x => x.CreatedAt)
                            .ToListItems()
                            .ToListAsync();

            return Ok(questions);
        }

        // Tanya Jawab: published questions with search, category and ustadz facets (several
        // values in one facet widen, different facets narrow), sort and paging. Filtering,
        // counting, sorting and paging run over a lightweight index of the matching questions;
        // only the page's questions are then loaded in full.
        [HttpGet("browse")]
        public async Task<IActionResult> Browse(
            [FromQuery] string? search,
            [FromQuery(Name = "category")] string[]? categories,
            [FromQuery(Name = "ustadz")] int[]? ustadz,
            [FromQuery] string? sort,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 8)
        {
            var published = _db.Questions.Where(x => x.Answers.Any());
            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                published = published.Where(x => x.Title.ToLower().Contains(term) || x.Content.ToLower().Contains(term));
            }

            var index = await published
                .Select(x => new BrowseRow
                {
                    Id = x.Id,
                    CategoryKey = x.Category == null ? null : x.Category.Key,
                    AnsweredById = x.Answers.OrderBy(a => a.User.Role == Roles.Guru ? 0 : 1).ThenBy(a => a.CreatedAt).Select(a => (int?)a.UserId).FirstOrDefault(),
                    AnsweredByRole = x.Answers.OrderBy(a => a.User.Role == Roles.Guru ? 0 : 1).ThenBy(a => a.CreatedAt).Select(a => a.User.Role).FirstOrDefault(),
                    AnswerLength = x.Answers.OrderBy(a => a.User.Role == Roles.Guru ? 0 : 1).ThenBy(a => a.CreatedAt).Select(a => (int?)a.Content.Length).FirstOrDefault() ?? 0,
                    CreatedAt = x.CreatedAt,
                    Views = x.Views,
                    Title = x.Title
                })
                .ToListAsync();

            var chosenCategories = (categories ?? Array.Empty<string>()).Where(c => !string.IsNullOrWhiteSpace(c)).ToHashSet();
            var chosenUstadz = (ustadz ?? Array.Empty<int>()).ToHashSet();
            bool InCategory(BrowseRow r) => chosenCategories.Count == 0 || (r.CategoryKey != null && chosenCategories.Contains(r.CategoryKey));
            bool ByUstadz(BrowseRow r) => chosenUstadz.Count == 0 || (r.AnsweredById != null && chosenUstadz.Contains(r.AnsweredById.Value));

            // Each facet is counted over the search and the other facet only, so ticking a
            // value never zeroes the values beside it.
            var categoryCounts = index.Where(ByUstadz).Where(r => r.CategoryKey != null)
                .GroupBy(r => r.CategoryKey!).ToDictionary(g => g.Key, g => g.Count());
            var ustadzCounts = index.Where(InCategory).Where(r => r.AnsweredByRole == Roles.Guru && r.AnsweredById != null)
                .GroupBy(r => r.AnsweredById!.Value).ToDictionary(g => g.Key, g => g.Count());

            var matching = index.Where(r => InCategory(r) && ByUstadz(r));
            var culture = System.Globalization.CultureInfo.GetCultureInfo("id-ID").CompareInfo;
            var ordered = (sort ?? "terbaru") switch
            {
                "terlama" => matching.OrderBy(r => r.CreatedAt),
                "populer" => matching.OrderByDescending(r => r.Views).ThenByDescending(r => r.CreatedAt),
                "singkat" => matching.OrderBy(r => r.ReadMinutes).ThenByDescending(r => r.CreatedAt),
                "abjad" => matching
                    .OrderBy(r => r.Title, Comparer<string>.Create((a, b) => culture.Compare(a, b, System.Globalization.CompareOptions.IgnoreCase)))
                    .ThenByDescending(r => r.CreatedAt),
                _ => matching.OrderByDescending(r => r.CreatedAt),
            };
            var sortedIds = ordered.Select(r => r.Id).ToList();

            var size = pageSize < 1 ? 8 : Math.Min(pageSize, 50);
            var total = sortedIds.Count;
            var totalPages = Math.Max(1, (int)Math.Ceiling(total / (double)size));
            var current = Math.Clamp(page, 1, totalPages);
            var pageIds = sortedIds.Skip((current - 1) * size).Take(size).ToList();

            var loaded = await _db.Questions.Where(x => pageIds.Contains(x.Id)).ToListItems().ToListAsync();
            var items = pageIds.Select(id => loaded.First(q => q.Id == id)).ToList();

            var categoryFacet = await _db.Categories
                .OrderBy(c => c.SortOrder)
                .Select(c => new { c.Key, c.Name })
                .ToListAsync();

            // Every Guru credited with a published question, whatever the current search.
            var guruIds = await _db.Questions
                .Where(x => x.Answers.Any())
                .Select(x => x.Answers.OrderBy(a => a.User.Role == Roles.Guru ? 0 : 1).ThenBy(a => a.CreatedAt)
                    .Select(a => a.User.Role == Roles.Guru ? (int?)a.UserId : null).FirstOrDefault())
                .Where(id => id != null)
                .Distinct()
                .ToListAsync();
            var gurus = await _db.Users
                .Where(u => guruIds.Contains(u.Id))
                .OrderBy(u => u.Name)
                .Select(u => new { u.Id, u.Name, u.Picture })
                .ToListAsync();

            var totalPublished = await _db.Questions.CountAsync(x => x.Answers.Any());

            return Ok(new
            {
                items,
                total,
                totalPublished,
                page = current,
                pageSize = size,
                totalPages,
                facets = new
                {
                    categories = categoryFacet.Select(c => new { key = c.Key, name = c.Name, count = categoryCounts.GetValueOrDefault(c.Key) }),
                    ustadz = gurus.Select(g => new { id = g.Id, name = g.Name, picture = g.Picture, count = ustadzCounts.GetValueOrDefault(g.Id) })
                }
            });
        }

        private class BrowseRow
        {
            public int Id { get; set; }
            public string? CategoryKey { get; set; }
            public int? AnsweredById { get; set; }
            public string? AnsweredByRole { get; set; }
            public int AnswerLength { get; set; }
            public DateTime CreatedAt { get; set; }
            public int Views { get; set; }
            public string Title { get; set; } = "";

            // Same estimate as QuestionListItem.ReadMinutes, so the sort matches what rows show.
            public int ReadMinutes => Math.Max(1, (AnswerLength + QuestionListItems.CharactersPerMinute - 1) / QuestionListItems.CharactersPerMinute);
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
                .ToListItems()
                .ToListAsync();

            return Ok(questions);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDetailQuestion(int id)
        {
            var question =
                await _db.Questions
                    .Include(x => x.User)
                    .Include(x => x.Category)

                    .Include(x => x.Answers)
                    .ThenInclude(x => x.User)

                    .Include(x => x.Answers)
                    .ThenInclude(x => x.Comments)

                    .FirstOrDefaultAsync(x =>
                        x.Id == id);

            // A hidden question answers 404 like a missing one, so a link does not reveal
            // that an unanswered question exists.
            if (question == null || !CanSee(question, await this.GetCurrentUserAsync(_db)))
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
                // Responses keep `category` as the key; the FE maps it to a name.
                Category = question.Category == null ? null : question.Category.Key,

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
            var question = await _db.Questions
                .Include(x => x.Answers)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (question == null || !CanSee(question, await this.GetCurrentUserAsync(_db)))
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

        private static bool IsStaff(User? user) =>
            user != null && (user.Role == Roles.Guru || user.Role == Roles.Admin);

        // Published (answered) questions are public; an unanswered one only to its asker and
        // to the Gurus and Admins who answer or moderate it.
        private static bool CanSee(Question question, User? user) =>
            question.Answers.Any() || (user != null && (user.Id == question.UserId || IsStaff(user)));
    }
}
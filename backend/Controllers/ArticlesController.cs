using System.Globalization;
using System.Text.RegularExpressions;
using backend.Articles;
using backend.Data;
using backend.DTOs;
using backend.Extensions;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    // Artikel: long-form writing by the ustadz. A Guru manages their own articles, an Admin
    // any; everyone reads the published ones. Drafts answer 404 to anyone else, so their
    // existence is not revealed.
    [ApiController]
    [Route("api/articles")]
    public partial class ArticlesController : Controller
    {
        private const int TitleMax = 160;
        private const int SummaryMax = 300;
        private const int BodyMax = 100_000;
        private const long CoverMax = 5 * 1024 * 1024;

        private readonly AppDbContext _db;

        public ArticlesController(AppDbContext db)
        {
            _db = db;
        }

        // Published articles with search, category and author facets (several values in one
        // facet widen, different facets narrow), sort and paging — the same rules as question
        // browse. With ?lead=1 the newest article is taken out as the Sorotan when the
        // canvas's rule holds, and paging runs over the rest.
        [HttpGet]
        public async Task<IActionResult> Browse(
            [FromQuery] string? search,
            [FromQuery(Name = "category")] string[]? categories,
            [FromQuery(Name = "author")] int[]? authors,
            [FromQuery] string? sort,
            [FromQuery] string? lead,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 8)
        {
            var published = _db.Articles.Where(a => a.Status == ArticleStatus.Published);
            var term = search?.Trim();
            if (!string.IsNullOrEmpty(term))
            {
                var pattern = "%" + term.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_") + "%";
                published = published.Where(a =>
                    EF.Functions.ILike(a.Title, pattern) ||
                    EF.Functions.ILike(a.Summary ?? "", pattern) ||
                    EF.Functions.ILike(a.BodyText, pattern));
            }

            var index = await published
                .Select(a => new BrowseRow
                {
                    Id = a.Id,
                    Title = a.Title,
                    CategoryKey = a.Category == null ? null : a.Category.Key,
                    AuthorId = a.AuthorId,
                    PublishedAt = a.PublishedAt ?? a.CreatedAt,
                    ReadMinutes = a.ReadMinutes,
                    Views = a.Views,
                    HasCover = a.Cover != null
                })
                .ToListAsync();

            var chosenCategories = (categories ?? Array.Empty<string>()).Where(c => !string.IsNullOrWhiteSpace(c)).ToHashSet();
            var chosenAuthors = (authors ?? Array.Empty<int>()).ToHashSet();
            bool InCategory(BrowseRow r) => chosenCategories.Count == 0 || (r.CategoryKey != null && chosenCategories.Contains(r.CategoryKey));
            bool ByAuthor(BrowseRow r) => chosenAuthors.Count == 0 || chosenAuthors.Contains(r.AuthorId);

            // Each facet is counted over the search and the other facet only.
            var categoryCounts = index.Where(ByAuthor).Where(r => r.CategoryKey != null)
                .GroupBy(r => r.CategoryKey!).ToDictionary(g => g.Key, g => g.Count());
            var authorCounts = index.Where(InCategory)
                .GroupBy(r => r.AuthorId).ToDictionary(g => g.Key, g => g.Count());

            var matching = index.Where(r => InCategory(r) && ByAuthor(r));
            var culture = CultureInfo.GetCultureInfo("id-ID").CompareInfo;
            var sortKey = sort is "terlama" or "populer" or "singkat" or "abjad" ? sort : "terbaru";
            var ordered = sortKey switch
            {
                "terlama" => matching.OrderBy(r => r.PublishedAt),
                "populer" => matching.OrderByDescending(r => r.Views).ThenByDescending(r => r.PublishedAt),
                "singkat" => matching.OrderBy(r => r.ReadMinutes).ThenByDescending(r => r.PublishedAt),
                "abjad" => matching
                    .OrderBy(r => r.Title, Comparer<string>.Create((a, b) => culture.Compare(a, b, CompareOptions.IgnoreCase)))
                    .ThenByDescending(r => r.PublishedAt),
                _ => matching.OrderByDescending(r => r.PublishedAt),
            };
            var sorted = ordered.ToList();

            // The Sorotan: only unfiltered and newest first, with more than three articles and
            // a cover on the newest.
            BrowseRow? leadRow = null;
            if (lead is "1" or "true" && string.IsNullOrEmpty(term) && chosenCategories.Count == 0 && chosenAuthors.Count == 0
                && sortKey == "terbaru" && sorted.Count > 3 && sorted[0].HasCover)
            {
                leadRow = sorted[0];
                sorted.RemoveAt(0);
            }

            var size = pageSize < 1 ? 8 : Math.Min(pageSize, 50);
            var total = sorted.Count;
            var totalPages = Math.Max(1, (int)Math.Ceiling(total / (double)size));
            var current = Math.Clamp(page, 1, totalPages);
            var pageIds = sorted.Skip((current - 1) * size).Take(size).Select(r => r.Id).ToList();
            // Sent on every page, so a later page can still count it; the page shows it on page 1.
            var leadId = leadRow?.Id;

            var wanted = leadId == null ? pageIds : pageIds.Append(leadId.Value).ToList();
            var loaded = await LoadItemsAsync(_db.Articles.Where(a => wanted.Contains(a.Id)));
            var items = pageIds.Select(id => loaded[id]).ToList();

            var categoryFacet = await _db.Categories.OrderBy(c => c.SortOrder).Select(c => new { c.Key, c.Name }).ToListAsync();
            // Every author of a published article, whatever the current search.
            var authorFacet = await _db.Articles.Where(a => a.Status == ArticleStatus.Published)
                .Select(a => new { a.Author.Id, a.Author.Name, a.Author.Picture })
                .Distinct()
                .ToListAsync();
            var totalPublished = await _db.Articles.CountAsync(a => a.Status == ArticleStatus.Published);

            return Ok(new
            {
                items,
                lead = leadId == null ? null : loaded[leadId.Value],
                total,
                totalPublished,
                page = current,
                pageSize = size,
                totalPages,
                facets = new
                {
                    categories = categoryFacet.Select(c => new { key = c.Key, name = c.Name, count = categoryCounts.GetValueOrDefault(c.Key) }),
                    authors = authorFacet.OrderBy(a => a.Name)
                        .Select(a => new { id = a.Id, name = a.Name, picture = a.Picture, count = authorCounts.GetValueOrDefault(a.Id) })
                }
            });
        }

        // "mine" is a literal segment, so it wins over "{id:int}" routing either way.
        [HttpGet("mine")]
        public async Task<IActionResult> Mine()
        {
            var user = await this.GetCurrentUserAsync(_db);
            if (user == null) return Unauthorized();
            if (!CanWrite(user)) return StatusCode(StatusCodes.Status403Forbidden);

            var mine = await _db.Articles.Where(a => a.AuthorId == user.Id)
                .OrderByDescending(a => a.UpdatedAt)
                .Select(a => new
                {
                    id = a.Id,
                    title = a.Title,
                    status = a.Status == ArticleStatus.Published ? "published" : "draft",
                    category = a.Category == null ? null : new { key = a.Category.Key, name = a.Category.Name },
                    publishedAt = a.PublishedAt,
                    updatedAt = a.UpdatedAt,
                    views = a.Views
                })
                .ToListAsync();
            return Ok(mine);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var article = await _db.Articles.Include(a => a.Author).Include(a => a.Category).FirstOrDefaultAsync(a => a.Id == id);
            if (article == null) return NotFound();
            if (article.Status != ArticleStatus.Published)
            {
                var user = await this.GetCurrentUserAsync(_db);
                if (user == null || !CanManage(user, article)) return NotFound();
            }
            return Ok(ToDetail(article));
        }

        [HttpPost("{id:int}/view")]
        public async Task<IActionResult> RecordView(int id)
        {
            var article = await _db.Articles.FirstOrDefaultAsync(a => a.Id == id && a.Status == ArticleStatus.Published);
            if (article == null) return NotFound();
            article.Views += 1;
            await _db.SaveChangesAsync();
            return Ok(new { views = article.Views });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SaveArticleRequest request)
        {
            var user = await this.GetCurrentUserAsync(_db);
            if (user == null) return Unauthorized();
            if (!CanWrite(user)) return StatusCode(StatusCodes.Status403Forbidden);

            var now = DateTime.UtcNow;
            var article = new Article { AuthorId = user.Id, Author = user, CreatedAt = now };
            var invalid = await ApplyAsync(article, request, now);
            if (invalid != null) return invalid;

            _db.Articles.Add(article);
            await _db.SaveChangesAsync();
            return StatusCode(StatusCodes.Status201Created, ToDetail(article));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] SaveArticleRequest request)
        {
            var user = await this.GetCurrentUserAsync(_db);
            if (user == null) return Unauthorized();
            var article = await _db.Articles.Include(a => a.Author).FirstOrDefaultAsync(a => a.Id == id);
            if (article == null) return NotFound();
            if (!CanManage(user, article))
            {
                // A draft the caller may not see does not exist for them.
                return article.Status == ArticleStatus.Published ? StatusCode(StatusCodes.Status403Forbidden) : NotFound();
            }

            var invalid = await ApplyAsync(article, request, DateTime.UtcNow);
            if (invalid != null) return invalid;

            await _db.SaveChangesAsync();
            return Ok(ToDetail(article));
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await this.GetCurrentUserAsync(_db);
            if (user == null) return Unauthorized();
            var article = await _db.Articles.FirstOrDefaultAsync(a => a.Id == id);
            if (article == null) return NotFound();
            if (!CanManage(user, article))
            {
                return article.Status == ArticleStatus.Published ? StatusCode(StatusCodes.Status403Forbidden) : NotFound();
            }

            _db.Articles.Remove(article);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // A cover checked by its first bytes, never its name, and stored under
        // uploads/articles/ for an article's `cover` to point at.
        [HttpPost("cover")]
        [RequestSizeLimit(10 * 1024 * 1024)]
        public async Task<IActionResult> UploadCover(IFormFile? file)
        {
            var user = await this.GetCurrentUserAsync(_db);
            if (user == null) return Unauthorized();
            if (!CanWrite(user)) return StatusCode(StatusCodes.Status403Forbidden);

            if (file == null || file.Length == 0) return BadRequest("Berkas kosong");
            if (file.Length > CoverMax) return BadRequest("Ukuran sampul maksimal 5 MB");

            var head = new byte[12];
            await using (var peek = file.OpenReadStream())
            {
                var read = await peek.ReadAtLeastAsync(head, head.Length, throwOnEndOfStream: false);
                if (read < head.Length) Array.Clear(head, read, head.Length - read);
            }
            var extension = ImageExtension(head);
            if (extension == null) return BadRequest("Sampul harus berupa gambar JPG, PNG atau WebP");

            var folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "articles");
            Directory.CreateDirectory(folder);
            var name = $"{Guid.NewGuid()}.{extension}";
            await using (var stream = new FileStream(Path.Combine(folder, name), FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            return Ok(new { cover = $"/uploads/articles/{name}" });
        }

        private static string? ImageExtension(byte[] b)
        {
            if (b[0] == 0xFF && b[1] == 0xD8 && b[2] == 0xFF) return "jpg";
            if (b[0] == 0x89 && b[1] == 0x50 && b[2] == 0x4E && b[3] == 0x47) return "png";
            if (b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F' && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') return "webp";
            return null;
        }

        private static bool CanWrite(User user) => user.Role == Roles.Guru || user.Role == Roles.Admin;

        // An Admin manages any article; a Guru only their own, and only while still a Guru.
        private static bool CanManage(User user, Article article) =>
            user.Role == Roles.Admin || (user.Role == Roles.Guru && article.AuthorId == user.Id);

        // Validates and copies the request onto the article; returns the 400 to send, if any.
        private async Task<IActionResult?> ApplyAsync(Article article, SaveArticleRequest request, DateTime now)
        {
            var title = request.Title?.Trim() ?? "";
            var summary = string.IsNullOrWhiteSpace(request.Summary) ? null : request.Summary.Trim();
            if (title.Length == 0) return BadRequest("Judul artikel harus diisi");
            if (title.Length > TitleMax) return BadRequest("Judul maksimal 160 karakter");
            if (summary?.Length > SummaryMax) return BadRequest("Ringkasan maksimal 300 karakter");
            if ((request.Body?.Length ?? 0) > BodyMax) return BadRequest("Isi artikel terlalu panjang");

            var body = ArticleHtml.Clean(request.Body);
            if (request.Publish && body.Text.Length == 0) return BadRequest("Isi artikel harus diisi sebelum diterbitkan");

            var category = string.IsNullOrWhiteSpace(request.Category)
                ? null
                : await _db.Categories.FirstOrDefaultAsync(c => c.Key == request.Category);

            article.Title = title;
            article.Summary = summary;
            article.Body = body.Html;
            article.BodyText = body.Text;
            article.ReadMinutes = body.ReadMinutes;
            article.Cover = request.Cover != null && OwnCover().IsMatch(request.Cover) ? request.Cover : null;
            article.CategoryId = category?.Id;
            article.Category = category;
            article.Status = request.Publish ? ArticleStatus.Published : ArticleStatus.Draft;
            if (request.Publish) article.PublishedAt ??= now;
            article.UpdatedAt = now;
            return null;
        }

        [GeneratedRegex(@"^/uploads/articles/[0-9a-f-]{36}\.(jpg|png|webp)$")]
        private static partial Regex OwnCover();

        private async Task<Dictionary<int, object>> LoadItemsAsync(IQueryable<Article> query)
        {
            var rows = await query
                .Select(a => new
                {
                    a.Id, a.Title, a.Summary, a.BodyText, a.Cover, a.PublishedAt, a.CreatedAt, a.ReadMinutes, a.Views,
                    Category = a.Category == null ? null : new { key = a.Category.Key, name = a.Category.Name },
                    Author = new { id = a.Author.Id, name = a.Author.Name, picture = a.Author.Picture, role = a.Author.Role, isUstadz = a.Author.Role == Roles.Guru || (a.Author.Role == Roles.Admin && !a.Author.HideAsUstadz) }
                })
                .ToListAsync();
            return rows.ToDictionary(r => r.Id, r => (object)new
            {
                id = r.Id,
                title = r.Title,
                summary = r.Summary ?? ArticleHtml.Excerpt(r.BodyText),
                cover = r.Cover,
                category = r.Category,
                author = r.Author,
                publishedAt = r.PublishedAt ?? r.CreatedAt,
                readMinutes = r.ReadMinutes,
                views = r.Views
            });
        }

        private static object ToDetail(Article a) => new
        {
            id = a.Id,
            title = a.Title,
            summary = a.Summary ?? "",
            cover = a.Cover,
            category = a.Category == null ? null : new { key = a.Category.Key, name = a.Category.Name },
            author = new { id = a.Author.Id, name = a.Author.Name, picture = a.Author.Picture, role = a.Author.Role, isUstadz = a.Author.Role == Roles.Guru || (a.Author.Role == Roles.Admin && !a.Author.HideAsUstadz) },
            status = a.Status == ArticleStatus.Published ? "published" : "draft",
            publishedAt = a.PublishedAt,
            updatedAt = a.UpdatedAt,
            readMinutes = a.ReadMinutes,
            views = a.Views,
            body = a.Body
        };

        private class BrowseRow
        {
            public int Id { get; set; }
            public string Title { get; set; } = "";
            public string? CategoryKey { get; set; }
            public int AuthorId { get; set; }
            public DateTime PublishedAt { get; set; }
            public int ReadMinutes { get; set; }
            public int Views { get; set; }
            public bool HasCover { get; set; }
        }
    }
}

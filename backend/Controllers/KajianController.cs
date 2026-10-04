using System.Globalization;
using backend.Articles;
using backend.Data;
using backend.DTOs;
using backend.Extensions;
using backend.Kajians;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    // Ngaji Bareng: kajian held on YouTube. A Guru manages the kajian they lead, an Admin any
    // (choosing which Guru leads it); everyone watches. Status follows the clock (KajianClock).
    [ApiController]
    [Route("api/kajian")]
    public class KajianController : Controller
    {
        private const int TitleMax = 160;
        private const int SeriesMax = 60;
        private const int DescriptionMax = 1000;
        private const int NotesMax = 100_000;
        private const int ScheduleDays = 7;

        private readonly AppDbContext _db;

        public KajianController(AppDbContext db)
        {
            _db = db;
        }

        // What is live now, the live one's latest earlier session with notes, and the week ahead.
        [HttpGet("now")]
        public async Task<IActionResult> Now()
        {
            var now = DateTime.UtcNow;
            var liveRow = await _db.Kajian
                .Where(k => k.StartsAt <= now && k.StartsAt.AddMinutes(k.DurationMinutes) > now)
                .OrderByDescending(k => k.StartsAt)
                .FirstOrDefaultAsync();

            Kajian? previous = null;
            if (liveRow != null)
            {
                var series = liveRow.Series.ToLower();
                previous = await _db.Kajian
                    .Where(k => k.Series.ToLower() == series && k.StartsAt < liveRow.StartsAt && k.NotesText != "")
                    .OrderByDescending(k => k.StartsAt)
                    .FirstOrDefaultAsync();
            }

            var until = now.AddDays(ScheduleDays);
            var schedule = await _db.Kajian
                .Where(k => k.StartsAt >= now && k.StartsAt <= until)
                .OrderBy(k => k.StartsAt)
                .ToListAsync();

            var all = schedule.Concat(new[] { liveRow, previous }.OfType<Kajian>()).ToList();
            var items = await ItemsAsync(all, now);
            return Ok(new
            {
                live = liveRow == null ? null : items[liveRow.Id],
                previousWithNotes = previous == null ? null : items[previous.Id],
                schedule = schedule.Select(k => items[k.Id])
            });
        }

        // The recording archive: ended kajian with search, series / ustadz / notes facets
        // (values in one facet widen, different facets narrow), sort and paging.
        [HttpGet]
        public async Task<IActionResult> Browse(
            [FromQuery] string? search,
            [FromQuery(Name = "series")] string[]? series,
            [FromQuery(Name = "ustadz")] int[]? ustadz,
            [FromQuery] string? notes,
            [FromQuery] string? sort,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 8)
        {
            var now = DateTime.UtcNow;
            var recorded = _db.Kajian.Where(k => k.StartsAt.AddMinutes(k.DurationMinutes) <= now);
            var term = search?.Trim();
            if (!string.IsNullOrEmpty(term))
            {
                var pattern = "%" + term.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_") + "%";
                recorded = recorded.Where(k =>
                    EF.Functions.ILike(k.Title, pattern) ||
                    EF.Functions.ILike(k.Description ?? "", pattern) ||
                    EF.Functions.ILike(k.Series, pattern) ||
                    EF.Functions.ILike(k.NotesText, pattern));
            }

            var index = await recorded
                .Select(k => new BrowseRow
                {
                    Id = k.Id,
                    Title = k.Title,
                    Series = k.Series,
                    UstadzId = k.UstadzId,
                    StartsAt = k.StartsAt,
                    DurationMinutes = k.DurationMinutes,
                    Views = k.Views,
                    HasNotes = k.NotesText != ""
                })
                .ToListAsync();

            var chosenSeries = (series ?? Array.Empty<string>()).Where(s => !string.IsNullOrWhiteSpace(s))
                .Select(s => s.Trim().ToLowerInvariant()).ToHashSet();
            var chosenUstadz = (ustadz ?? Array.Empty<int>()).ToHashSet();
            var notesOnly = notes is "1" or "true";
            bool InSeries(BrowseRow r) => chosenSeries.Count == 0 || chosenSeries.Contains(r.Series.ToLowerInvariant());
            bool ByUstadz(BrowseRow r) => chosenUstadz.Count == 0 || chosenUstadz.Contains(r.UstadzId);
            bool WithNotes(BrowseRow r) => !notesOnly || r.HasNotes;

            // Each facet is counted over every filter but its own. Series group ignoring case,
            // shown with the spelling most used.
            var seriesFacet = index
                .GroupBy(r => r.Series.ToLowerInvariant())
                .Select(g => new
                {
                    key = g.Key,
                    name = g.GroupBy(r => r.Series).OrderByDescending(x => x.Count()).First().Key,
                    count = g.Count(r => ByUstadz(r) && WithNotes(r))
                })
                .ToList();
            var ustadzCounts = index.Where(r => InSeries(r) && WithNotes(r))
                .GroupBy(r => r.UstadzId).ToDictionary(g => g.Key, g => g.Count());
            var notesCount = index.Count(r => InSeries(r) && ByUstadz(r) && r.HasNotes);

            var matching = index.Where(r => InSeries(r) && ByUstadz(r) && WithNotes(r));
            var culture = CultureInfo.GetCultureInfo("id-ID").CompareInfo;
            var ordered = (sort ?? "terbaru") switch
            {
                "terlama" => matching.OrderBy(r => r.StartsAt),
                "populer" => matching.OrderByDescending(r => r.Views).ThenByDescending(r => r.StartsAt),
                "singkat" => matching.OrderBy(r => r.DurationMinutes).ThenByDescending(r => r.StartsAt),
                "abjad" => matching
                    .OrderBy(r => r.Title, Comparer<string>.Create((a, b) => culture.Compare(a, b, CompareOptions.IgnoreCase)))
                    .ThenByDescending(r => r.StartsAt),
                _ => matching.OrderByDescending(r => r.StartsAt),
            };
            var sortedIds = ordered.Select(r => r.Id).ToList();

            var size = pageSize < 1 ? 8 : Math.Min(pageSize, 50);
            var total = sortedIds.Count;
            var totalPages = Math.Max(1, (int)Math.Ceiling(total / (double)size));
            var current = Math.Clamp(page, 1, totalPages);
            var pageIds = sortedIds.Skip((current - 1) * size).Take(size).ToList();

            var rows = await _db.Kajian.Where(k => pageIds.Contains(k.Id)).ToListAsync();
            var items = await ItemsAsync(rows, now);

            var ustadzIds = index.Select(r => r.UstadzId).Distinct().ToList();
            var gurus = await _db.Users.Where(u => ustadzIds.Contains(u.Id))
                .Select(u => new { u.Id, u.Name, u.Picture }).ToListAsync();
            var totalRecorded = await _db.Kajian.CountAsync(k => k.StartsAt.AddMinutes(k.DurationMinutes) <= now);

            return Ok(new
            {
                items = pageIds.Select(id => items[id]),
                total,
                totalRecorded,
                page = current,
                pageSize = size,
                totalPages,
                facets = new
                {
                    series = seriesFacet.OrderBy(s => s.name, StringComparer.Create(CultureInfo.GetCultureInfo("id-ID"), true)),
                    ustadz = gurus.OrderBy(g => g.Name)
                        .Select(g => new { id = g.Id, name = g.Name, picture = g.Picture, count = ustadzCounts.GetValueOrDefault(g.Id) }),
                    notes = notesCount
                }
            });
        }

        // Literal segment, so it wins over "{id:int}".
        [HttpGet("mine")]
        public async Task<IActionResult> Mine()
        {
            var user = await this.GetCurrentUserAsync(_db);
            if (user == null) return Unauthorized();
            if (!CanWrite(user)) return StatusCode(StatusCodes.Status403Forbidden);

            var rows = await _db.Kajian
                .Where(k => user.Role == Roles.Admin || k.UstadzId == user.Id)
                .OrderByDescending(k => k.StartsAt)
                .ToListAsync();
            var items = await ItemsAsync(rows, DateTime.UtcNow);
            return Ok(rows.Select(k => items[k.Id]));
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var kajian = await _db.Kajian.FirstOrDefaultAsync(k => k.Id == id);
            if (kajian == null) return NotFound();
            return Ok(await DetailAsync(kajian));
        }

        [HttpPost("{id:int}/view")]
        public async Task<IActionResult> RecordView(int id)
        {
            var kajian = await _db.Kajian.FirstOrDefaultAsync(k => k.Id == id);
            if (kajian == null) return NotFound();
            kajian.Views += 1;
            await _db.SaveChangesAsync();
            return Ok(new { views = kajian.Views });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SaveKajianRequest request)
        {
            var user = await this.GetCurrentUserAsync(_db);
            if (user == null) return Unauthorized();
            if (!CanWrite(user)) return StatusCode(StatusCodes.Status403Forbidden);

            var now = DateTime.UtcNow;
            var kajian = new Kajian { CreatedAt = now };
            var invalid = await ApplyAsync(kajian, request, user, now);
            if (invalid != null) return invalid;

            _db.Kajian.Add(kajian);
            await _db.SaveChangesAsync();
            return StatusCode(StatusCodes.Status201Created, await DetailAsync(kajian));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] SaveKajianRequest request)
        {
            var user = await this.GetCurrentUserAsync(_db);
            if (user == null) return Unauthorized();
            var kajian = await _db.Kajian.FirstOrDefaultAsync(k => k.Id == id);
            if (kajian == null) return NotFound();
            if (!CanManage(user, kajian)) return StatusCode(StatusCodes.Status403Forbidden);

            var invalid = await ApplyAsync(kajian, request, user, DateTime.UtcNow);
            if (invalid != null) return invalid;

            await _db.SaveChangesAsync();
            return Ok(await DetailAsync(kajian));
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await this.GetCurrentUserAsync(_db);
            if (user == null) return Unauthorized();
            var kajian = await _db.Kajian.FirstOrDefaultAsync(k => k.Id == id);
            if (kajian == null) return NotFound();
            if (!CanManage(user, kajian)) return StatusCode(StatusCodes.Status403Forbidden);

            _db.Kajian.Remove(kajian);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        private static bool CanWrite(User user) => user.Role == Roles.Guru || user.Role == Roles.Admin;

        // An Admin manages any kajian; a Guru only the ones they lead, and only while a Guru.
        private static bool CanManage(User user, Kajian kajian) =>
            user.Role == Roles.Admin || (user.Role == Roles.Guru && kajian.UstadzId == user.Id);

        // Validates and copies the request onto the kajian; returns the 400 to send, if any.
        private async Task<IActionResult?> ApplyAsync(Kajian kajian, SaveKajianRequest request, User user, DateTime now)
        {
            var title = request.Title?.Trim() ?? "";
            var series = request.Series?.Trim() ?? "";
            var description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
            if (title.Length == 0) return BadRequest("Judul kajian harus diisi");
            if (title.Length > TitleMax) return BadRequest("Judul maksimal 160 karakter");
            if (series.Length == 0 || series.Length > SeriesMax) return BadRequest("Seri harus diisi, maksimal 60 karakter");
            if (description?.Length > DescriptionMax) return BadRequest("Deskripsi maksimal 1.000 karakter");
            var youtubeId = YouTubeLink.TryParseId(request.Youtube);
            if (youtubeId == null) return BadRequest("Tautan YouTube tidak dikenali");
            if (request.StartsAt == null) return BadRequest("Waktu mulai harus diisi");
            if (request.DurationMinutes < 5 || request.DurationMinutes > 600) return BadRequest("Durasi antara 5 dan 600 menit");
            if ((request.Notes?.Length ?? 0) > NotesMax) return BadRequest("Catatan terlalu panjang");

            int ustadzId;
            if (user.Role == Roles.Admin)
            {
                if (request.Ustadz == null || !await _db.Users.Ustadz().AnyAsync(u => u.Id == request.Ustadz))
                {
                    return BadRequest("Ustadz yang dipilih tidak tersedia");
                }
                ustadzId = request.Ustadz.Value;
            }
            else
            {
                ustadzId = user.Id;
            }

            var startsAt = request.StartsAt.Value;
            startsAt = startsAt.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(startsAt, DateTimeKind.Utc) : startsAt.ToUniversalTime();
            var cleanNotes = ArticleHtml.Clean(request.Notes);

            kajian.Title = title;
            kajian.Series = series;
            kajian.Description = description;
            kajian.YoutubeId = youtubeId;
            kajian.StartsAt = startsAt;
            kajian.DurationMinutes = request.DurationMinutes;
            kajian.Notes = cleanNotes.Html;
            kajian.NotesText = cleanNotes.Text;
            kajian.UstadzId = ustadzId;
            kajian.UpdatedAt = now;
            return null;
        }

        // Session numbers for the given kajian: position within their series by start time.
        private async Task<Dictionary<int, int>> SessionNumbersAsync(IEnumerable<Kajian> kajian)
        {
            var seriesKeys = kajian.Select(k => k.Series.ToLower()).Distinct().ToList();
            var rows = await _db.Kajian.Where(k => seriesKeys.Contains(k.Series.ToLower()))
                .Select(k => new { k.Id, Key = k.Series.ToLower(), k.StartsAt })
                .ToListAsync();
            return rows.GroupBy(r => r.Key)
                .SelectMany(g => g.OrderBy(r => r.StartsAt).ThenBy(r => r.Id).Select((r, i) => (r.Id, Number: i + 1)))
                .ToDictionary(x => x.Id, x => x.Number);
        }

        private async Task<Dictionary<int, object>> ItemsAsync(List<Kajian> kajian, DateTime now)
        {
            var distinct = kajian.DistinctBy(k => k.Id).ToList();
            if (distinct.Count == 0) return new Dictionary<int, object>();
            var numbers = await SessionNumbersAsync(distinct);
            var ustadzIds = distinct.Select(k => k.UstadzId).Distinct().ToList();
            var ustadz = await _db.Users.Where(u => ustadzIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => new { id = u.Id, name = u.Name, picture = u.Picture, role = u.Role, isUstadz = u.Role == Roles.Guru || (u.Role == Roles.Admin && !u.HideAsUstadz) });
            return distinct.ToDictionary(k => k.Id, k => (object)new
            {
                id = k.Id,
                title = k.Title,
                description = k.Description ?? "",
                series = k.Series,
                youtubeId = k.YoutubeId,
                thumbnail = YouTubeLink.Thumbnail(k.YoutubeId),
                startsAt = k.StartsAt,
                endsAt = KajianClock.EndsAt(k),
                durationMinutes = k.DurationMinutes,
                status = KajianClock.StatusOf(k.StartsAt, k.DurationMinutes, now),
                sessionNumber = numbers.GetValueOrDefault(k.Id, 1),
                hasNotes = k.NotesText.Length > 0,
                views = k.Views,
                ustadz = ustadz.GetValueOrDefault(k.UstadzId)
            });
        }

        private async Task<object> DetailAsync(Kajian kajian)
        {
            var now = DateTime.UtcNow;
            var key = kajian.Series.ToLower();
            var inSeries = await _db.Kajian.Where(k => k.Series.ToLower() == key)
                .OrderBy(k => k.StartsAt).ThenBy(k => k.Id)
                .Select(k => new { k.Id, k.Title, k.StartsAt, k.DurationMinutes })
                .ToListAsync();
            var item = (await ItemsAsync(new List<Kajian> { kajian }, now))[kajian.Id];
            return new
            {
                kajian = item,
                notes = kajian.Notes,
                seriesSessions = inSeries.Select((k, i) => new
                {
                    id = k.Id,
                    title = k.Title,
                    startsAt = k.StartsAt,
                    status = KajianClock.StatusOf(k.StartsAt, k.DurationMinutes, now),
                    sessionNumber = i + 1
                }).Where(s => s.id != kajian.Id)
            };
        }

        private class BrowseRow
        {
            public int Id { get; set; }
            public string Title { get; set; } = "";
            public string Series { get; set; } = "";
            public int UstadzId { get; set; }
            public DateTime StartsAt { get; set; }
            public int DurationMinutes { get; set; }
            public int Views { get; set; }
            public bool HasNotes { get; set; }
        }
    }
}

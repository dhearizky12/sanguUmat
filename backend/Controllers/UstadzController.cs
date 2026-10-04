using backend.Data;
using backend.DTOs;
using backend.Extensions;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    // The Dewan Ustadz: every user with the Guru role, with their public profile.
    [ApiController]
    [Route("api/ustadz")]
    public class UstadzController : Controller
    {
        private const int TitleMax = 120;
        private const int BioMax = 1000;
        private const int EducationMax = 10;

        private readonly AppDbContext _db;

        public UstadzController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> List()
        {
            var gurus = await _db.Users.Ustadz()
                .Select(u => new { u.Id, u.Name, u.Picture })
                .ToListAsync();
            var ids = gurus.Select(g => g.Id).ToList();
            var titles = await _db.UstadzProfiles.Where(p => ids.Contains(p.UserId))
                .ToDictionaryAsync(p => p.UserId, p => p.Title);
            var expertise = await ExpertiseByUserAsync(ids);
            var counts = await AnswerCountsAsync(ids);

            var list = gurus
                .Select(g => new
                {
                    id = g.Id,
                    name = g.Name,
                    picture = g.Picture,
                    title = titles.GetValueOrDefault(g.Id, ""),
                    expertise = expertise.GetValueOrDefault(g.Id) ?? new List<object>(),
                    answerCount = counts.GetValueOrDefault(g.Id)
                })
                .OrderByDescending(x => x.answerCount)
                .ThenBy(x => x.name)
                .ToList();
            return Ok(list);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var profile = await ReadAsync(id);
            return profile == null ? NotFound() : Ok(profile);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUstadzProfileRequest request)
        {
            var caller = await this.GetCurrentUserAsync(_db);
            if (caller == null)
            {
                return Unauthorized();
            }

            var ustadz = await _db.Users.Ustadz().FirstOrDefaultAsync(u => u.Id == id);
            if (ustadz == null)
            {
                return NotFound();
            }

            // Only the ustadz themself or an Admin.
            if (caller.Id != id && caller.Role != Roles.Admin)
            {
                return StatusCode(StatusCodes.Status403Forbidden);
            }

            var title = (request.Title ?? "").Trim();
            var bio = (request.Bio ?? "").Trim();
            if (title.Length > TitleMax) return BadRequest("Gelar maksimal 120 karakter");
            if (bio.Length > BioMax) return BadRequest("Profil singkat maksimal 1.000 karakter");

            var education = (request.Education ?? new List<UstadzEducationDto>()).ToList();
            var maxYear = DateTime.UtcNow.Year + 10;
            bool ValidYear(int? y) => y == null || (y >= 1900 && y <= maxYear);
            if (education.Count > EducationMax
                || education.Any(e => string.IsNullOrWhiteSpace(e.Institution)
                    || !ValidYear(e.StartYear) || !ValidYear(e.EndYear)
                    || (e.StartYear != null && e.EndYear != null && e.StartYear > e.EndYear)))
            {
                return BadRequest("Riwayat pendidikan tidak valid");
            }

            // Unknown keys are ignored rather than rejected.
            var keys = (request.Expertise ?? new List<string>()).Distinct().ToList();
            var categoryIds = await _db.Categories.Where(c => keys.Contains(c.Key)).Select(c => c.Id).ToListAsync();

            var profile = await _db.UstadzProfiles.FirstOrDefaultAsync(p => p.UserId == id);
            if (profile == null)
            {
                profile = new UstadzProfile { UserId = id };
                _db.UstadzProfiles.Add(profile);
            }
            profile.Title = title;
            profile.Bio = bio;
            profile.UpdatedAt = DateTime.UtcNow;

            // Replaced wholesale; the single SaveChanges below applies it all atomically.
            _db.UstadzExpertise.RemoveRange(await _db.UstadzExpertise.Where(x => x.UserId == id).ToListAsync());
            _db.UstadzExpertise.AddRange(categoryIds.Select(c => new UstadzExpertise { UserId = id, CategoryId = c }));

            _db.UstadzEducation.RemoveRange(await _db.UstadzEducation.Where(x => x.UserId == id).ToListAsync());
            _db.UstadzEducation.AddRange(education.Select((e, i) => new UstadzEducation
            {
                UserId = id,
                Institution = e.Institution!.Trim(),
                Degree = string.IsNullOrWhiteSpace(e.Degree) ? null : e.Degree.Trim(),
                StartYear = e.StartYear,
                EndYear = e.EndYear,
                SortOrder = i
            }));

            await _db.SaveChangesAsync();

            return Ok(await ReadAsync(id));
        }

        // The full public profile of a Guru, or null when the id is not a Guru. A Guru with
        // no profile row reads as an empty profile.
        private async Task<object?> ReadAsync(int id)
        {
            var user = await _db.Users.Ustadz().Where(u => u.Id == id)
                .Select(u => new { u.Id, u.Name, u.Picture, u.CreatedAt })
                .FirstOrDefaultAsync();
            if (user == null) return null;

            var profile = await _db.UstadzProfiles.FirstOrDefaultAsync(p => p.UserId == id);
            var expertise = await ExpertiseByUserAsync(new List<int> { id });
            var education = await _db.UstadzEducation.Where(e => e.UserId == id)
                .OrderBy(e => e.SortOrder)
                .Select(e => new { institution = e.Institution, degree = e.Degree, startYear = e.StartYear, endYear = e.EndYear })
                .ToListAsync();
            var counts = await AnswerCountsAsync(new List<int> { id });

            return new
            {
                id = user.Id,
                name = user.Name,
                picture = user.Picture,
                title = profile?.Title ?? "",
                bio = profile?.Bio ?? "",
                expertise = expertise.GetValueOrDefault(id) ?? new List<object>(),
                education,
                answerCount = counts.GetValueOrDefault(id),
                joinedAt = user.CreatedAt
            };
        }

        // Expertise per user, as { key, name } in the categories' order.
        private async Task<Dictionary<int, List<object>>> ExpertiseByUserAsync(List<int> ids)
        {
            var rows = await _db.UstadzExpertise
                .Where(x => ids.Contains(x.UserId))
                .OrderBy(x => x.Category.SortOrder)
                .Select(x => new { x.UserId, x.Category.Key, x.Category.Name })
                .ToListAsync();
            return rows.GroupBy(r => r.UserId)
                .ToDictionary(g => g.Key, g => g.Select(r => (object)new { key = r.Key, name = r.Name }).ToList());
        }

        // Answers are only ever on published questions (a question is published once answered).
        private async Task<Dictionary<int, int>> AnswerCountsAsync(List<int> ids) =>
            // Only answers on published questions: a private answer is not shown, so not counted.
            await _db.Answers.Where(a => ids.Contains(a.UserId) && a.Question.AllowPublish)
                .GroupBy(a => a.UserId)
                .Select(g => new { g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Key, x => x.Count);
    }
}

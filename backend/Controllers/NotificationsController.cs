using backend.Data;
using backend.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    // A signed-in user's own notifications. Nobody else's are ever reachable: every query is
    // scoped to the caller, and another user's id answers 404.
    [ApiController]
    [Route("api/notifications")]
    public class NotificationsController : Controller
    {
        private const int PageSize = 20;
        private readonly AppDbContext _db;

        public NotificationsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> List([FromQuery] int page = 1)
        {
            var user = await this.GetCurrentUserAsync(_db);
            if (user == null) return Unauthorized();

            var mine = _db.Notifications.Where(n => n.RecipientId == user.Id);
            var total = await mine.CountAsync();
            var totalPages = Math.Max(1, (int)Math.Ceiling(total / (double)PageSize));
            var current = Math.Clamp(page, 1, totalPages);
            var rows = await mine.OrderByDescending(n => n.CreatedAt).ThenByDescending(n => n.Id)
                .Skip((current - 1) * PageSize).Take(PageSize)
                .Select(n => new { n.Id, n.Type, n.Text, n.Actor, n.Link, n.QuestionId, n.AnswerId, n.Count, n.ReadAt, n.CreatedAt })
                .ToListAsync();

            return Ok(new
            {
                items = rows.Select(n => new
                {
                    id = n.Id,
                    type = n.Type,
                    text = n.Text,
                    actor = n.Actor,
                    link = LinkOf(n.Link, n.QuestionId, n.AnswerId),
                    count = n.Count,
                    read = n.ReadAt != null,
                    createdAt = n.CreatedAt
                }),
                unread = await mine.CountAsync(n => n.ReadAt == null),
                page = current,
                totalPages
            });
        }

        // Kept tiny: the header polls it.
        [HttpGet("unread-count")]
        public async Task<IActionResult> UnreadCount()
        {
            var user = await this.GetCurrentUserAsync(_db);
            if (user == null) return Unauthorized();
            return Ok(new { unread = await _db.Notifications.CountAsync(n => n.RecipientId == user.Id && n.ReadAt == null) });
        }

        [HttpPost("{id:int}/read")]
        public async Task<IActionResult> Read(int id)
        {
            var user = await this.GetCurrentUserAsync(_db);
            if (user == null) return Unauthorized();
            var n = await _db.Notifications.FirstOrDefaultAsync(x => x.Id == id && x.RecipientId == user.Id);
            if (n == null) return NotFound();
            n.ReadAt ??= DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("read-all")]
        public async Task<IActionResult> ReadAll()
        {
            var user = await this.GetCurrentUserAsync(_db);
            if (user == null) return Unauthorized();
            var now = DateTime.UtcNow;
            await _db.Notifications.Where(n => n.RecipientId == user.Id && n.ReadAt == null)
                .ExecuteUpdateAsync(s => s.SetProperty(n => n.ReadAt, now));
            return NoContent();
        }

        // An app path the SPA routes itself (the base path is its router's business). A
        // notification whose question has since been deleted falls back to Pertanyaan saya.
        private static string LinkOf(string? link, int? questionId, int? answerId) =>
            link ?? (questionId is int q
                ? $"/question/detail/{q}" + (answerId is int a ? $"#jawaban-{a}" : "")
                : "/question/create#riwayat");
    }
}

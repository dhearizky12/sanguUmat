using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using backend.Data;
using backend.DTOs;
using backend.Extensions;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    public class CategoriesController : Controller
    {
        private const string NameRequired = "Nama kategori harus diisi";
        private const string NameTaken = "Kategori dengan nama ini sudah ada";

        private readonly AppDbContext _db;

        public CategoriesController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("api/categories")]
        public async Task<IActionResult> GetCategories()
        {
            return Ok(await ListAsync());
        }

        [HttpPost("api/admin/categories")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest request)
        {
            var denied = await RequireAdminAsync();
            if (denied != null) return denied;

            var name = request.Name?.Trim() ?? "";
            var key = ToKey(name);
            if (key.Length == 0)
            {
                return BadRequest(NameRequired);
            }

            if (await IsTakenAsync(name, key, exceptId: null))
            {
                return Conflict(NameTaken);
            }

            var category = new Category
            {
                Key = key,
                Name = name,
                SortOrder = (await _db.Categories.MaxAsync(c => (int?)c.SortOrder) ?? 0) + 1,
                CreatedAt = DateTime.UtcNow
            };
            _db.Categories.Add(category);
            await _db.SaveChangesAsync();

            return StatusCode(StatusCodes.Status201Created, await ToDtoAsync(category));
        }

        [HttpPut("api/admin/categories/{key}")]
        public async Task<IActionResult> UpdateCategory(string key, [FromBody] UpdateCategoryRequest request)
        {
            var denied = await RequireAdminAsync();
            if (denied != null) return denied;

            var category = await _db.Categories.FirstOrDefaultAsync(c => c.Key == key);
            if (category == null)
            {
                return NotFound();
            }

            if (request.Name != null)
            {
                // Renaming changes the name only; the key stays, so links and filters survive.
                var name = request.Name.Trim();
                if (ToKey(name).Length == 0)
                {
                    return BadRequest(NameRequired);
                }
                if (await IsTakenAsync(name, keyToCheck: null, exceptId: category.Id))
                {
                    return Conflict(NameTaken);
                }
                category.Name = name;
            }

            if (request.SortOrder != null)
            {
                await MoveAsync(category, request.SortOrder.Value);
            }

            await _db.SaveChangesAsync();
            return Ok(await ToDtoAsync(category));
        }

        [HttpDelete("api/admin/categories/{key}")]
        public async Task<IActionResult> DeleteCategory(string key)
        {
            var denied = await RequireAdminAsync();
            if (denied != null) return denied;

            var category = await _db.Categories.FirstOrDefaultAsync(c => c.Key == key);
            if (category == null)
            {
                return NotFound();
            }

            // The foreign key is ON DELETE SET NULL, so its questions become uncategorised
            // ("Lainnya") in the same statement.
            _db.Categories.Remove(category);
            await _db.SaveChangesAsync();

            var rest = await _db.Categories.OrderBy(c => c.SortOrder).ToListAsync();
            for (var i = 0; i < rest.Count; i++) rest[i].SortOrder = i + 1;
            await _db.SaveChangesAsync();

            return NoContent();
        }

        // "Haji & Umrah" → "haji-umrah": lower case, accents dropped, anything that is not a
        // letter or digit collapsed into one hyphen.
        private static string ToKey(string name)
        {
            var decomposed = name.Normalize(NormalizationForm.FormD);
            var plain = new StringBuilder();
            foreach (var ch in decomposed)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(ch) != UnicodeCategory.NonSpacingMark) plain.Append(ch);
            }
            return Regex.Replace(plain.ToString().ToLowerInvariant(), "[^a-z0-9]+", "-").Trim('-');
        }

        private async Task<bool> IsTakenAsync(string name, string? keyToCheck, int? exceptId)
        {
            var lower = name.ToLower();
            return await _db.Categories.AnyAsync(c =>
                c.Id != exceptId && (c.Name.ToLower() == lower || (keyToCheck != null && c.Key == keyToCheck)));
        }

        // Puts the category at `position` (clamped to 1…n) and renumbers the rest so the
        // order never has gaps or ties.
        private async Task MoveAsync(Category category, int position)
        {
            var others = await _db.Categories
                .Where(c => c.Id != category.Id)
                .OrderBy(c => c.SortOrder)
                .ToListAsync();
            var index = Math.Clamp(position, 1, others.Count + 1) - 1;
            others.Insert(index, category);
            for (var i = 0; i < others.Count; i++) others[i].SortOrder = i + 1;
        }

        private async Task<IActionResult?> RequireAdminAsync()
        {
            var user = await this.GetCurrentUserAsync(_db);
            if (user == null) return Unauthorized();
            if (user.Role != Roles.Admin) return Forbid();
            return null;
        }

        private Task<List<CategoryDto>> ListAsync() =>
            _db.Categories
                .OrderBy(c => c.SortOrder)
                .Select(c => new CategoryDto(c.Key, c.Name, c.SortOrder, c.Questions.Count))
                .ToListAsync();

        private async Task<CategoryDto> ToDtoAsync(Category category) =>
            new(category.Key, category.Name, category.SortOrder,
                await _db.Questions.CountAsync(q => q.CategoryId == category.Id));

        private record CategoryDto(string Key, string Name, int SortOrder, int QuestionCount);
    }
}

using backend.Data;
using backend.DTOs;
using backend.Extensions;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/admin/users")]
    public class AdminController : Controller
    {
        private readonly AppDbContext _db;

        public AdminController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery] string? search, [FromQuery] string? role)
        {
            var currentUser = await this.GetCurrentUserAsync(_db);

            if (currentUser == null)
            {
                return Unauthorized();
            }

            if (currentUser.Role != Roles.Admin)
            {
                return Forbid();
            }

            var query = _db.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(x =>
                    x.Name.ToLower().Contains(search.ToLower()) ||
                    x.Email.ToLower().Contains(search.ToLower()));
            }

            if (!string.IsNullOrWhiteSpace(role))
            {
                query = query.Where(x => x.Role == role);
            }

            var users = await query
                .OrderBy(x => x.Name)
                .Select(x => new
                {
                    x.Id,
                    x.Name,
                    x.Email,
                    x.Role,
                    x.CreatedAt,
                    x.LastLogin
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPatch("{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateUserRoleRequest request)
        {
            var currentUser = await this.GetCurrentUserAsync(_db);

            if (currentUser == null)
            {
                return Unauthorized();
            }

            if (currentUser.Role != Roles.Admin)
            {
                return Forbid();
            }

            var allowedRoles = new[] { Roles.User, Roles.Guru, Roles.Admin };
            if (!allowedRoles.Contains(request.Role))
            {
                return BadRequest();
            }

            var targetUser = await _db.Users.FirstOrDefaultAsync(x => x.Id == id);

            if (targetUser == null)
            {
                return NotFound();
            }

            // Cegah admin mengunci dirinya sendiri dengan menurunkan role sendiri.
            if (targetUser.Id == currentUser.Id && request.Role != Roles.Admin)
            {
                return BadRequest();
            }

            targetUser.Role = request.Role;
            targetUser.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Ok(new
            {
                targetUser.Id,
                targetUser.Name,
                targetUser.Email,
                targetUser.Role
            });
        }
    }
}

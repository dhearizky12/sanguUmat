using backend.Accounts;
using backend.Data;
using backend.DTOs;
using backend.Extensions;
using backend.Models;
using backend.Notifications;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/admin/users")]
    public class AdminController : Controller
    {
        private readonly AppDbContext _db;
        private readonly Notifier _notifier;

        public AdminController(AppDbContext db, Notifier notifier)
        {
            _db = db;
            _notifier = notifier;
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

            var query = _db.Users.Where(x => x.DeletedAt == null);

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
                    HiddenAsUstadz = x.HideAsUstadz,
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

            var targetUser = await _db.Users.FirstOrDefaultAsync(x => x.Id == id && x.DeletedAt == null);

            if (targetUser == null)
            {
                return NotFound();
            }

            // Cegah admin mengunci dirinya sendiri dengan menurunkan role sendiri.
            if (targetUser.Id == currentUser.Id && request.Role != Roles.Admin)
            {
                return BadRequest();
            }

            var changed = targetUser.Role != request.Role;
            targetUser.Role = request.Role;
            targetUser.UpdatedAt = DateTime.UtcNow;
            if (changed)
            {
                _notifier.RoleChanged(targetUser, currentUser);
            }

            await _db.SaveChangesAsync();

            return Ok(new
            {
                targetUser.Id,
                targetUser.Name,
                targetUser.Email,
                targetUser.Role
            });
        }

        // Hide an Admin from the ustadz lists, or show them again (specs/admin-users). Only Admins
        // can be hidden: every other role is listed, or not, by its role alone.
        [HttpPatch("{id}/ustadz")]
        public async Task<IActionResult> UpdateUstadzVisibility(int id, [FromBody] UpdateUstadzVisibilityRequest request)
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

            var targetUser = await _db.Users.FirstOrDefaultAsync(x => x.Id == id && x.DeletedAt == null);

            if (targetUser == null)
            {
                return NotFound();
            }

            if (targetUser.Role != Roles.Admin)
            {
                return BadRequest();
            }

            targetUser.HideAsUstadz = request.Hidden;
            targetUser.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new
            {
                targetUser.Id,
                targetUser.Name,
                targetUser.Email,
                targetUser.Role,
                HiddenAsUstadz = targetUser.HideAsUstadz
            });
        }

        // Delete another user (specs/account-deletion): anonymised, what they wrote stays.
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
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

            var targetUser = await _db.Users.FirstOrDefaultAsync(x => x.Id == id && x.DeletedAt == null);

            if (targetUser == null)
            {
                return NotFound();
            }

            // Not your own account: an Admin must not remove their own access.
            if (targetUser.Id == currentUser.Id)
            {
                return BadRequest();
            }

            await AccountDeleter.DeleteAsync(_db, targetUser);
            return NoContent();
        }
    }
}

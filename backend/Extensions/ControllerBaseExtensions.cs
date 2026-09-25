using System.Security.Claims;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Extensions
{
    public static class ControllerBaseExtensions
    {
        // Replaces the ClaimTypes.NameIdentifier -> _db.Users.FirstOrDefaultAsync lookup that
        // was duplicated across AuthController, QuestionController, and AnswerController.
        public static async Task<User?> GetCurrentUserAsync(this ControllerBase controller, AppDbContext db)
        {
            var googleId = controller.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return await db.Users.FirstOrDefaultAsync(x => x.GoogleId == googleId);
        }
    }
}

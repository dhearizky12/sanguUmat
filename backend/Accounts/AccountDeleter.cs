using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Accounts
{
    // Deleting an account (specs/account-deletion). The row is kept as a marker and anonymised
    // rather than removed: every answer, comment, article, post and kajian points at it, and
    // names are read from it at request time, so they all turn into "Hamba Allah" without
    // touching a content table. The Google id stays on the row so a token issued before the
    // deletion cannot create a fresh account (see AuthController.Me and Token).
    public static class AccountDeleter
    {
        public const string DeletedName = "Hamba Allah";

        public static async Task DeleteAsync(AppDbContext db, User user)
        {
            var id = user.Id;
            var oldName = user.Name;
            var oldPicture = user.Picture;

            // Questions nobody else can use: unanswered, or not allowed to be published. EF
            // cascades remove their answers and comments. Posts are answered and published, so
            // they are never in this set.
            var gone = await db.Questions.Where(q => q.UserId == id && (!q.AllowPublish || !q.Answers.Any())).ToListAsync();
            db.Questions.RemoveRange(gone);

            // Questions directed to them are directed to nobody.
            foreach (var q in await db.Questions.Where(q => q.DirectedToId == id).ToListAsync())
            {
                q.DirectedToId = null;
            }

            // Notifications they received go; ones they caused sit in other people's lists with
            // their name at the start, so the name is replaced there.
            db.Notifications.RemoveRange(await db.Notifications.Where(n => n.RecipientId == id).ToListAsync());
            if (!string.IsNullOrWhiteSpace(oldName) && oldName != DeletedName)
            {
                foreach (var n in await db.Notifications.Where(n => n.RecipientId != id && n.Actor == oldName).ToListAsync())
                {
                    n.Actor = DeletedName;
                    if (n.Text.StartsWith(oldName)) n.Text = DeletedName + n.Text[oldName.Length..];
                }
            }

            // The ustadz profile.
            db.UstadzExpertise.RemoveRange(await db.UstadzExpertise.Where(e => e.UserId == id).ToListAsync());
            db.UstadzEducation.RemoveRange(await db.UstadzEducation.Where(e => e.UserId == id).ToListAsync());
            db.UstadzProfiles.RemoveRange(await db.UstadzProfiles.Where(p => p.UserId == id).ToListAsync());

            // The person.
            user.Name = DeletedName;
            user.Email = $"deleted-{id}@deleted.invalid";
            user.Picture = null;
            user.Phone = null;
            user.Address = null;
            user.Role = Roles.User;
            user.HideAsUstadz = false;
            user.DeletedAt = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;

            await db.SaveChangesAsync();

            DeleteUpload(oldPicture);
        }

        // Only our own uploads are files on disk; a Google photo is just a URL.
        private static void DeleteUpload(string? picture)
        {
            if (string.IsNullOrEmpty(picture) || !picture.StartsWith("/uploads/")) return;
            var file = Path.GetFileName(picture);
            if (string.IsNullOrEmpty(file)) return;
            var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", file);
            try
            {
                if (File.Exists(path)) File.Delete(path);
            }
            catch (IOException)
            {
                // The data is already anonymised; a file left behind is not worth failing for.
            }
        }
    }
}

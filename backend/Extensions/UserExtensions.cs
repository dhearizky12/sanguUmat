using backend.Models;

namespace backend.Extensions
{
    public static class UserExtensions
    {
        // A profile is complete with a way to address the person (a name) and a way to reach
        // them (an email or a phone). Google sign-in supplies both name and email, so a
        // Google account is complete from creation; a phone-only sign-in still needs a name.
        public static bool IsProfileComplete(this User user) =>
            !string.IsNullOrWhiteSpace(user.Name)
            && (!string.IsNullOrWhiteSpace(user.Email) || !string.IsNullOrWhiteSpace(user.Phone));
    }
}

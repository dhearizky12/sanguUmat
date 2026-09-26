using System.Linq.Expressions;
using backend.Models;

namespace backend.Queries
{
    // The one definition of who may see a question and whose name is shown. Every list,
    // count and detail goes through here, so no page can leak a private answer or an
    // anonymous asker by forgetting a condition.
    public static class QuestionVisibility
    {
        public const string AnonymousName = "Hamba Allah";

        // Published: answered, and the asker allowed the answer to be shown.
        public static readonly Expression<Func<Question, bool>> IsPublishedExpr =
            q => q.AllowPublish && q.Answers.Any();

        private static readonly Func<Question, bool> IsPublishedFn = IsPublishedExpr.Compile();

        public static IQueryable<Question> Published(this IQueryable<Question> questions) =>
            questions.Where(IsPublishedExpr);

        public static bool IsStaff(User? user) =>
            user != null && (user.Role == Roles.Guru || user.Role == Roles.Admin);

        // Published questions are public; any other only to its asker and to the Gurus and
        // Admins who answer or moderate it. Needs Answers loaded.
        public static bool CanSee(Question question, User? viewer) =>
            IsPublishedFn(question) || (viewer != null && (viewer.Id == question.UserId || IsStaff(viewer)));

        // Whether this viewer is shown an anonymous asker's real identity.
        public static bool SeesAsker(int askerId, User? viewer) =>
            viewer != null && (viewer.Id == askerId || IsStaff(viewer));

        // Hides an anonymous asker from anyone but themselves, Gurus and Admins.
        public static T Mask<T>(this T item, User? viewer) where T : QuestionListItem
        {
            if (item.IsAnonymous && !SeesAsker(item.UserId ?? 0, viewer))
            {
                item.UserId = null;
                item.UserName = AnonymousName;
                item.UserPicture = null;
            }
            return item;
        }

        public static List<T> Mask<T>(this List<T> items, User? viewer) where T : QuestionListItem
        {
            items.ForEach(i => i.Mask(viewer));
            return items;
        }
    }
}

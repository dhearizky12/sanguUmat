using System.Linq.Expressions;

namespace backend.Models
{
    // The one definition of who counts as an ustadz (specs/ustadz-profiles): a Guru, or an
    // Admin who has not been hidden from the ustadz lists. Used wherever the app lists, credits
    // or notifies an ustadz. Answering is wider: any Guru or Admin may answer (CanAnswer).
    //
    // EF cannot call IsUstadz() inside a query over a navigation (a.User...), so such
    // projections repeat the same condition inline, next to a comment pointing here. Keep them
    // in step with IsUstadzExpr.
    public static class UstadzRules
    {
        public static readonly Expression<Func<User, bool>> IsUstadzExpr =
            u => u.Role == Roles.Guru || (u.Role == Roles.Admin && !u.HideAsUstadz);

        private static readonly Func<User, bool> IsUstadzFn = IsUstadzExpr.Compile();

        public static bool IsUstadz(User user) => IsUstadzFn(user);

        public static bool CanAnswer(User user) => user.Role == Roles.Guru || user.Role == Roles.Admin;

        public static IQueryable<User> Ustadz(this IQueryable<User> users) => users.Where(IsUstadzExpr);
    }
}

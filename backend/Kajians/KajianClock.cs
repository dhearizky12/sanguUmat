using backend.Models;

namespace backend.Kajians
{
    // A kajian's state follows the clock: scheduled before its start, live until start +
    // duration, recorded after. Computed on every read, so nothing can be stuck on "live".
    public static class KajianClock
    {
        public const string Scheduled = "scheduled";
        public const string Live = "live";
        public const string Recorded = "recorded";

        public static DateTime EndsAt(Kajian k) => k.StartsAt.AddMinutes(k.DurationMinutes);

        public static string StatusOf(DateTime startsAt, int durationMinutes, DateTime now) =>
            now < startsAt ? Scheduled : now < startsAt.AddMinutes(durationMinutes) ? Live : Recorded;
    }
}

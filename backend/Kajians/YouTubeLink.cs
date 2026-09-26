using System.Text.RegularExpressions;

namespace backend.Kajians
{
    // The video id in a pasted YouTube link: watch?v=, youtu.be/, /live/, /embed/, /shorts/
    // (with or without www./m./music., extra parameters) or the bare 11-character id.
    public static partial class YouTubeLink
    {
        public static string? TryParseId(string? input)
        {
            var value = input?.Trim() ?? "";
            if (BareId().IsMatch(value)) return value;
            var m = Url().Match(value);
            return m.Success ? m.Groups["id"].Value : null;
        }

        public static string Thumbnail(string id) => $"https://i.ytimg.com/vi/{id}/hqdefault.jpg";

        [GeneratedRegex(@"^[A-Za-z0-9_-]{11}$")]
        private static partial Regex BareId();

        [GeneratedRegex(
            @"^(?:https?://)?(?:(?:www|m|music)\.)?(?:youtube\.com/(?:watch\?(?:[^#]*&)?v=|live/|embed/|shorts/|v/)|youtu\.be/)(?<id>[A-Za-z0-9_-]{11})(?:[?&#/].*)?$",
            RegexOptions.IgnoreCase)]
        private static partial Regex Url();
    }
}

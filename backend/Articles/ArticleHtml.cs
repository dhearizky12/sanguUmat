using System.Net;
using System.Text.RegularExpressions;
using Ganss.Xss;

namespace backend.Articles
{
    // The one trust boundary for article HTML: whatever a client sends, only this allowlist
    // is stored. It mirrors the editor's toolbar (frontend/src/components/article/Editor.jsx),
    // so nothing an author formats is lost on save — keep the two in step.
    public static partial class ArticleHtml
    {
        public const int WordsPerMinute = 200;

        private static readonly string[] Tags =
            { "p", "br", "h2", "h3", "strong", "em", "u", "s", "blockquote", "ul", "ol", "li", "hr", "a" };
        private static readonly HashSet<string> Dropped =
            new() { "script", "style", "noscript", "template", "iframe", "object", "embed", "svg", "math", "textarea", "select", "head", "title" };
        private static readonly string[] Schemes = { "http", "https", "mailto" };

        private static HtmlSanitizer Create()
        {
            var sanitizer = new HtmlSanitizer();
            sanitizer.AllowedTags.Clear();
            foreach (var tag in Tags) sanitizer.AllowedTags.Add(tag);
            sanitizer.AllowedAttributes.Clear();
            sanitizer.AllowedAttributes.Add("href");
            sanitizer.AllowedSchemes.Clear();
            foreach (var scheme in Schemes) sanitizer.AllowedSchemes.Add(scheme);
            sanitizer.AllowedCssProperties.Clear();
            sanitizer.AllowedAtRules.Clear();
            sanitizer.AllowedClasses.Clear();
            sanitizer.AllowDataAttributes = false;
            // Unknown tags (spans and divs pasted from Word or a web page) are unwrapped, not
            // dropped, so their text survives as plain text.
            sanitizer.KeepChildNodes = true;
            // ...except elements whose content is never prose: those go with their content.
            sanitizer.RemovingTag += (_, e) =>
            {
                if (Dropped.Contains(e.Tag.LocalName)) e.Tag.InnerHtml = "";
            };
            sanitizer.PostProcessNode += (_, e) =>
            {
                if (e.Node is not AngleSharp.Dom.IElement el || el.LocalName != "a") return;
                var href = el.GetAttribute("href");
                // Relative addresses pass the sanitiser's scheme check; only absolute
                // http(s) and mailto links are kept.
                if (href == null || !AbsoluteLink().IsMatch(href)) el.RemoveAttribute("href");
                else
                {
                    el.SetAttribute("target", "_blank");
                    el.SetAttribute("rel", "noopener noreferrer nofollow");
                }
            };
            return sanitizer;
        }

        public record Result(string Html, string Text, int ReadMinutes);

        public static Result Clean(string? html)
        {
            var clean = Create().Sanitize(html ?? "");
            var text = ToText(clean);
            if (text.Length == 0) clean = "";
            var words = text.Length == 0 ? 0 : Whitespace().Split(text).Length;
            var minutes = Math.Max(1, (words + WordsPerMinute - 1) / WordsPerMinute);
            return new Result(clean, text, minutes);
        }

        // The body as text with one space between blocks. Safe to do by pattern because the
        // input is already sanitised down to the allowlist above.
        private static string ToText(string html)
        {
            var spaced = BlockBoundary().Replace(html, " ");
            var stripped = AnyTag().Replace(spaced, "");
            return Whitespace().Replace(WebUtility.HtmlDecode(stripped), " ").Trim();
        }

        // First 200 characters of the text, cut back to a word boundary, ending in "…".
        public static string Excerpt(string text, int max = 200)
        {
            if (text.Length <= max) return text;
            var cut = text[..max];
            var space = cut.LastIndexOf(' ');
            if (space > max / 2) cut = cut[..space];
            return cut.TrimEnd(' ', ',', '.', ';', ':') + "…";
        }

        [GeneratedRegex(@"^(https?://|mailto:)", RegexOptions.IgnoreCase)]
        private static partial Regex AbsoluteLink();

        [GeneratedRegex(@"<br\s*/?>|</(p|h2|h3|li|blockquote)>|<hr\s*/?>", RegexOptions.IgnoreCase)]
        private static partial Regex BlockBoundary();

        [GeneratedRegex(@"<[^>]+>")]
        private static partial Regex AnyTag();

        [GeneratedRegex(@"\s+")]
        private static partial Regex Whitespace();
    }
}

namespace backend.Articles
{
    // What gets stored for an answer. Formatted answers go through the article allowlist
    // (ArticleHtml), plain ones are only trimmed; either way an answer with no text is refused.
    public static class AnswerContent
    {
        public const string EmptyMessage = "Jawaban tidak boleh kosong";

        // The content to store, or null when there is no text to store.
        public static string? Prepare(string? content, bool isHtml)
        {
            if (string.IsNullOrWhiteSpace(content)) return null;
            if (!isHtml) return content.Trim();
            var clean = ArticleHtml.Clean(content);
            return clean.Text.Length == 0 ? null : clean.Html;
        }
    }
}

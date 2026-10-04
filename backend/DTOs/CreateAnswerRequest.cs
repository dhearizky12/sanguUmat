namespace backend.DTOs
{
    public class CreateAnswerRequest
    {
        public string? Content { get; set; }

        // True when Content is the editor's HTML; omitted means plain text, as before.
        public bool IsHtml { get; set; }
    }
}

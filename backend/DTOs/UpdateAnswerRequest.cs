namespace backend.DTOs
{
    public class UpdateAnswerRequest
    {
        public string? Content { get; set; }

        public bool IsHtml { get; set; }
    }
}

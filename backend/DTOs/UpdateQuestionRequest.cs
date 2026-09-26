namespace backend.DTOs
{
    public class UpdateQuestionRequest
    {
        public string Title { get; set; } = "";
        public string Content { get; set; } = "";
        // Omitted choices keep their stored values.
        public bool? IsAnonymous { get; set; }
        public bool? AllowPublish { get; set; }
    }
}

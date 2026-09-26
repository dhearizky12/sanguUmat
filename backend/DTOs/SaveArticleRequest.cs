namespace backend.DTOs
{
    // The whole article at once: saving replaces every field, and Publish sets the status.
    public class SaveArticleRequest
    {
        public string? Title { get; set; }
        public string? Summary { get; set; }
        public string? Body { get; set; }
        public string? Cover { get; set; }
        public string? Category { get; set; }
        public bool Publish { get; set; }
    }
}

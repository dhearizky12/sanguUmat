namespace backend.DTOs
{
    // A ustadz post: a question and its answer published together (see specs/ustadz-posts).
    public class SavePostRequest
    {
        public string? Title { get; set; }
        public string? Content { get; set; }
        public string? Answer { get; set; }
        public string? Category { get; set; }
        // Admin: the ustadz the post is credited to (required when posting). A Guru may only
        // name themselves, or leave it out.
        public int? UstadzId { get; set; }
    }
}

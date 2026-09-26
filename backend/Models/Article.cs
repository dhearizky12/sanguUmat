namespace backend.Models
{
    // A long-form article by an ustadz (or an Admin). Body is sanitised HTML; BodyText and
    // ReadMinutes are derived from it on every save, so search and sorting never parse HTML.
    public class Article
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string? Summary { get; set; }
        public string Body { get; set; } = "";
        public string BodyText { get; set; } = "";
        public int ReadMinutes { get; set; } = 1;
        public string? Cover { get; set; }

        public int? CategoryId { get; set; }
        public Category? Category { get; set; }

        public int AuthorId { get; set; }
        public User Author { get; set; } = null!;

        public string Status { get; set; } = ArticleStatus.Draft;
        // Set on first publish and kept through unpublishing, so republishing an old article
        // does not make it the newest.
        public DateTime? PublishedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int Views { get; set; }
    }

    public static class ArticleStatus
    {
        public const string Draft = "Draft";
        public const string Published = "Published";
    }
}

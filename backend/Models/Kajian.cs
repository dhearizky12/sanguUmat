namespace backend.Models
{
    // A kajian held on YouTube (live stream or upload), organised on the site. Its status is
    // never stored: it follows the clock (Kajian/KajianClock). Notes are sanitised HTML with
    // NotesText derived on every save, like an article body.
    public class Kajian
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string? Description { get; set; }
        public string Series { get; set; } = "";

        public int UstadzId { get; set; }
        public User Ustadz { get; set; } = null!;

        public string YoutubeId { get; set; } = "";
        public DateTime StartsAt { get; set; }
        public int DurationMinutes { get; set; }

        public string Notes { get; set; } = "";
        public string NotesText { get; set; } = "";

        public int Views { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}

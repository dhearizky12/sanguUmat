namespace backend.DTOs
{
    // The whole kajian at once. `Youtube` is any YouTube link or a bare video id; `Ustadz` is
    // read only for an Admin (a Guru always leads their own).
    public class SaveKajianRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Series { get; set; }
        public string? Youtube { get; set; }
        public DateTime? StartsAt { get; set; }
        public int DurationMinutes { get; set; }
        public string? Notes { get; set; }
        public int? Ustadz { get; set; }
    }
}

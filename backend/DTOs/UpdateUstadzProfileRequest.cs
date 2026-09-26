namespace backend.DTOs
{
    // The whole profile at once: saving replaces title, bio, expertise and education.
    public class UpdateUstadzProfileRequest
    {
        public string? Title { get; set; }
        public string? Bio { get; set; }
        public List<string>? Expertise { get; set; }
        public List<UstadzEducationDto>? Education { get; set; }
    }

    public class UstadzEducationDto
    {
        public string? Institution { get; set; }
        public string? Degree { get; set; }
        public int? StartYear { get; set; }
        public int? EndYear { get; set; }
    }
}

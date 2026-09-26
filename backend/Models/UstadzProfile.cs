namespace backend.Models
{
    // A Guru's public profile. A Guru without a row simply has an empty profile; the row
    // is created on first save and kept if the role is later taken away.
    public class UstadzProfile
    {
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public string Title { get; set; } = "";
        public string Bio { get; set; } = "";
        public DateTime UpdatedAt { get; set; }
    }

    // One area of expertise, chosen from the categories.
    public class UstadzExpertise
    {
        public int UserId { get; set; }
        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;
    }

    // One line of education history, kept in the order it was entered.
    public class UstadzEducation
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Institution { get; set; } = "";
        public string? Degree { get; set; }
        public int? StartYear { get; set; }
        public int? EndYear { get; set; }
        public int SortOrder { get; set; }
    }
}

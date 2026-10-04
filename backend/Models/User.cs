namespace backend.Models
{
    public class User
    {
        public int Id { get; set;}
        public string GoogleId {get; set;} = "";
        public string Email { get; set;} = "";
        public string Name { get; set;} = "";
        public string? Picture { get; set;}
        public string? Phone { get; set;}
        public string? Address { get; set;}
        public string Role { get; set;} = "User";

        // An Admin hidden from the ustadz lists (specs/admin-users). Only meaningful for Admins.
        public bool HideAsUstadz { get; set; }

        // Set when the account is deleted (specs/account-deletion). The row stays, anonymised, so
        // what the person wrote keeps its place; it is treated as nobody everywhere.
        public DateTime? DeletedAt { get; set; }
        public bool HasCompletedProfile { get; set;} = false;
        public ICollection<Answer> Answers { get; set;}
        public DateTime CreatedAt { get; set;}
        public DateTime UpdatedAt { get; set;}
        public DateTime LastLogin { get; set;}

        public List<Question> Questions {get;set;} = new List<Question>();
    }
}
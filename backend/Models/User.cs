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
        public string? Role { get; set;}
        public DateTime CreatedAt { get; set;}
        public DateTime UpdatedAt { get; set;}
        public DateTime LastLogin { get; set;}
    }
}
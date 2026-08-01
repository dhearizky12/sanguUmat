namespace backend.Models
{
    public class Comment
    {
        public int Id { get; set; }
        public string Content { get; set; } = "";
        public DateTime CreatedAt { get; set; }

        public int AnswerId { get; set; }
        public Answer Answer { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }
    }
}

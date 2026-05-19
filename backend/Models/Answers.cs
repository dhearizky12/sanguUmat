namespace backend.Models
{
    public class Answer
    {
        public int Id { get; set; }

        public string Content { get; set; }

        public DateTime CreatedAt { get; set; }

        // RELASI QUESTION
        public int QuestionId { get; set; }

        public Question Question { get; set; }

        // RELASI USER (GURU)
        public int UserId { get; set; }

        public User User { get; set; }
    }
}
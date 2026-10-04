namespace backend.Models
{
    public class Answer
    {
        public int Id { get; set; }

        public string Content { get; set; }

        // Content is sanitised editor HTML (ArticleHtml) rather than plain text. Answers written
        // before formatting existed stay false and are shown as plain text.
        public bool IsHtml { get; set; }

        public DateTime CreatedAt { get; set; }

        // RELASI QUESTION
        public int QuestionId { get; set; }

        public Question Question { get; set; }

        // RELASI USER (GURU)
        public int UserId { get; set; }

        public User User { get; set; }

        public ICollection<Comment> Comments { get; set; }
    }
}
namespace backend.Models
{
    // One in-app notification. Text and actor are stored rendered (and masked for this
    // recipient), so a notification reads the same after a title changes or the question is
    // deleted. The link is built at read time from Question/Answer (set null when those are
    // deleted) or taken from Link for notifications about anything else.
    public class Notification
    {
        public int Id { get; set; }

        public int RecipientId { get; set; }
        public User Recipient { get; set; } = null!;

        public string Type { get; set; } = "";
        public string? Actor { get; set; }
        public string Text { get; set; } = "";
        public string? Link { get; set; }

        public int? QuestionId { get; set; }
        public Question? Question { get; set; }
        public int? AnswerId { get; set; }
        public Answer? Answer { get; set; }

        public int Count { get; set; } = 1;
        public DateTime? ReadAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public static class NotificationTypes
    {
        public const string AnswerPosted = "answer_posted";
        public const string AnswerEdited = "answer_edited";
        public const string CommentOnQuestion = "comment_on_question";
        public const string CommentAfterYou = "comment_after_you";
        public const string QuestionDeleted = "question_deleted";
        public const string RoleChanged = "role_changed";
        public const string QuestionDirected = "question_directed";
        public const string QuestionNew = "question_new";
        public const string CommentOnAnswer = "comment_on_answer";
        public const string QuestionEdited = "question_edited";
    }
}

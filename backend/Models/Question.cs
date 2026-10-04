namespace backend.Models
{
    public class Question
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string Content { get; set; } = "";

        public DateTime CreatedAt {get; set;}
        public int Views {get; set;} = 0;
        public int? CategoryId {get; set;}
        public Category? Category {get; set;}

        public int UserId {get;set;}
        public User User {get; set;}

        // The asker's choices when asking. Anonymous hides their name from the public;
        // without AllowPublish an answered question stays private (QuestionVisibility).
        public bool IsAnonymous { get; set; }
        public bool AllowPublish { get; set; } = true;

        // A post: published by an ustadz (or an Admin for them) together with its answer, with no
        // asker. UserId is then the credited ustadz, who also wrote the one answer.
        public bool IsPost { get; set; }

        // The ustadz the asker addressed it to, if any. Any Guru may still answer.
        public int? DirectedToId { get; set; }
        public User? DirectedTo { get; set; }
        public ICollection<Answer> Answers{ get; set; }
    } 
}
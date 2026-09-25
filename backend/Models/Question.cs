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
        public ICollection<Answer> Answers{ get; set; }
    } 
}
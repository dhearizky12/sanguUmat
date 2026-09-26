namespace backend.DTOs
{
    public class CreateQuestionRequest
    {
        public string Title {get; set;} = "";
        public string Content { get; set;} = "";
        public string? Category { get; set;}
        // A Guru's user id, or null for "Ustadz mana saja".
        public int? DirectedTo { get; set; }
        public bool IsAnonymous { get; set; }
        public bool AllowPublish { get; set; } = true;
    }
}
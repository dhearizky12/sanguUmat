namespace backend.DTOs
{
    public class CreateQuestionRequest
    {
        public string Title {get; set;} = "";
        public string Content { get; set;} = "";
    }
}
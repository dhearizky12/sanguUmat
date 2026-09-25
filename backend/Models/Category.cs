namespace backend.Models
{
    // A topic questions are filed under. Key is derived from the name once and never
    // changes, so links and ?category= filters survive a rename.
    public class Category
    {
        public int Id { get; set; }
        public string Key { get; set; } = "";
        public string Name { get; set; } = "";
        public int SortOrder { get; set; }
        public DateTime CreatedAt { get; set; }

        public List<Question> Questions { get; set; } = new List<Question>();
    }
}

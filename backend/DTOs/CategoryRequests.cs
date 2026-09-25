namespace backend.DTOs
{
    public class CreateCategoryRequest
    {
        public string Name { get; set; } = "";
    }

    // Either field may be sent alone: a rename, a move, or both.
    public class UpdateCategoryRequest
    {
        public string? Name { get; set; }
        public int? SortOrder { get; set; }
    }
}

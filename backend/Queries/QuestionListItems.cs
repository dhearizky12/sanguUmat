using System.Text.Json.Serialization;
using backend.Models;

namespace backend.Queries
{
    // One question as the lists show it: GET /api/question, /mine and /browse. Pass it
    // through QuestionVisibility.Mask before returning it to anyone.
    public class QuestionListItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string Content { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public int Views { get; set; }
        public string? Category { get; set; }
        // Null for an anonymous asker the viewer may not see (QuestionVisibility.Mask).
        public int? UserId { get; set; }
        public string UserName { get; set; } = "";
        public string? UserPicture { get; set; }
        public string? AnsweredBy { get; set; }
        public string? AnsweredByRole { get; set; }
        public string? AnsweredByPicture { get; set; }
        public bool IsAnswered { get; set; }
        public int CommentCount { get; set; }
        public int ReadMinutes { get; set; }
        public bool IsAnonymous { get; set; }
        public bool AllowPublish { get; set; }
        public bool IsPost { get; set; }
        public PersonRef? DirectedTo { get; set; }

        // Used by /browse to filter by ustadz; not part of the response.
        [JsonIgnore]
        public int? AnsweredById { get; set; }
    }

    public class PersonRef
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
    }

    public static class QuestionListItems
    {
        // About 6 characters a word at 200 words a minute.
        public const int CharactersPerMinute = 1200;

        // The answer a list credits: a Guru's when there is one, otherwise the earliest.
        // Every featured-answer field below uses this same ordering.
        public static IQueryable<QuestionListItem> ToListItems(this IQueryable<Question> questions) =>
            questions.Select(x => new QuestionListItem
            {
                Id = x.Id,
                Title = x.Title,
                Content = x.Content,
                CreatedAt = x.CreatedAt,
                Views = x.Views,
                Category = x.Category == null ? null : x.Category.Key,
                UserId = x.User.Id,
                IsAnonymous = x.IsAnonymous,
                AllowPublish = x.AllowPublish,
                IsPost = x.IsPost,
                DirectedTo = x.DirectedTo == null ? null : new PersonRef { Id = x.DirectedTo.Id, Name = x.DirectedTo.Name },
                UserName = x.User.Name,
                UserPicture = x.User.Picture,
                AnsweredById = x.Answers.OrderBy(a => a.User.Role == Roles.Guru ? 0 : 1).ThenBy(a => a.CreatedAt).Select(a => (int?)a.UserId).FirstOrDefault(),
                AnsweredBy = x.Answers.OrderBy(a => a.User.Role == Roles.Guru ? 0 : 1).ThenBy(a => a.CreatedAt).Select(a => a.User.Name).FirstOrDefault(),
                AnsweredByRole = x.Answers.OrderBy(a => a.User.Role == Roles.Guru ? 0 : 1).ThenBy(a => a.CreatedAt).Select(a => a.User.Role).FirstOrDefault(),
                AnsweredByPicture = x.Answers.OrderBy(a => a.User.Role == Roles.Guru ? 0 : 1).ThenBy(a => a.CreatedAt).Select(a => a.User.Picture).FirstOrDefault(),
                IsAnswered = x.Answers.Any(),
                CommentCount = x.Answers.SelectMany(a => a.Comments).Count(),
                ReadMinutes = Math.Max(1,
                    ((x.Answers.OrderBy(a => a.User.Role == Roles.Guru ? 0 : 1).ThenBy(a => a.CreatedAt).Select(a => (int?)a.Content.Length).FirstOrDefault() ?? 0)
                        + CharactersPerMinute - 1) / CharactersPerMinute)
            });
    }
}

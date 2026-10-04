using backend.Data;
using backend.Models;
using backend.Queries;
using Microsoft.EntityFrameworkCore;

namespace backend.Notifications
{
    // Who is told what. Controllers say what happened; this stages the notifications on the
    // DbContext, and the controller's own SaveChangesAsync persists them with the action —
    // so a notification never exists for an action that failed. Each call is one event:
    // nobody hears of their own action, nobody is told twice (rules apply in order), private
    // questions only notify people who may open them, and an anonymous asker stays "Hamba
    // Allah" to anyone who may not see their name.
    public class Notifier
    {
        private const int TitleMax = 80;
        private readonly AppDbContext _db;

        public Notifier(AppDbContext db)
        {
            _db = db;
        }

        public async Task QuestionAsked(Question question, User asker)
        {
            var ev = new Event(this, asker, question);
            if (question.DirectedToId is int directed)
            {
                var ustadz = await _db.Users.FirstOrDefaultAsync(u => u.Id == directed);
                if (ustadz != null)
                    ev.Add(ustadz, NotificationTypes.QuestionDirected,
                        $"{ev.ActorFor(ustadz)} mengajukan pertanyaan untukmu: {Short(question.Title)}", toAnswer: false);
            }
            foreach (var guru in await GurusAsync())
            {
                await ev.Merge(guru, NotificationTypes.QuestionNew, subject: null,
                    count => count == 1
                        ? $"{ev.ActorFor(guru)} mengajukan pertanyaan baru: {Short(question.Title)}"
                        : $"{count} pertanyaan baru menunggu jawaban",
                    link: "/jawab-pertanyaan");
            }
        }

        public async Task QuestionEdited(Question question, User asker)
        {
            var ev = new Event(this, asker, question);
            var recipients = question.DirectedToId is int directed
                ? await _db.Users.Ustadz().Where(u => u.Id == directed).ToListAsync()
                : await GurusAsync();
            foreach (var r in recipients)
            {
                await ev.Merge(r, NotificationTypes.QuestionEdited, subject: question.Id,
                    _ => $"{ev.ActorFor(r)} mengubah pertanyaan: {Short(question.Title)}", link: null);
            }
        }

        public async Task QuestionDeletedByAdmin(Question question, User admin)
        {
            // Posts notify nobody (specs/ustadz-posts).
            if (question.IsPost) return;
            var asker = await _db.Users.FirstOrDefaultAsync(u => u.Id == question.UserId);
            if (asker == null) return;
            // The question row is going away, so this one links to Pertanyaan saya instead.
            new Event(this, admin, null).Add(asker, NotificationTypes.QuestionDeleted,
                $"Pertanyaanmu dihapus oleh Admin: {Short(question.Title)}", toAnswer: false, link: "/question/create#riwayat");
        }

        public async Task AnswerPosted(Question question, Answer answer, User ustadz)
        {
            var asker = await _db.Users.FirstOrDefaultAsync(u => u.Id == question.UserId);
            if (asker == null) return;
            new Event(this, ustadz, question, answer).Add(asker, NotificationTypes.AnswerPosted,
                $"{ustadz.Name} menjawab pertanyaanmu: {Short(question.Title)}");
        }

        public async Task AnswerEdited(Question question, Answer answer, User editor)
        {
            if (question.IsPost) return;
            var asker = await _db.Users.FirstOrDefaultAsync(u => u.Id == question.UserId);
            var writer = await _db.Users.FirstOrDefaultAsync(u => u.Id == answer.UserId);
            if (asker == null || writer == null) return;
            new Event(this, editor, question, answer).Add(asker, NotificationTypes.AnswerEdited,
                $"{writer.Name} memperbarui jawaban atas pertanyaanmu: {Short(question.Title)}");
        }

        public async Task CommentPosted(Question question, Answer answer, User commenter)
        {
            var ev = new Event(this, commenter, question, answer);
            var title = Short(question.Title);

            var asker = await _db.Users.FirstOrDefaultAsync(u => u.Id == question.UserId);
            if (asker != null)
                ev.Add(asker, NotificationTypes.CommentOnQuestion, $"{ev.ActorFor(asker)} mengomentari jawaban atas pertanyaanmu: {title}");

            var writer = await _db.Users.FirstOrDefaultAsync(u => u.Id == answer.UserId);
            if (writer != null)
                ev.Add(writer, NotificationTypes.CommentOnAnswer, $"{ev.ActorFor(writer)} mengomentari jawabanmu pada: {title}");

            var earlierIds = await _db.Comments.Where(c => c.AnswerId == answer.Id).Select(c => c.UserId).Distinct().ToListAsync();
            var earlier = await _db.Users.Where(u => earlierIds.Contains(u.Id)).ToListAsync();
            foreach (var r in earlier)
                ev.Add(r, NotificationTypes.CommentAfterYou, $"{ev.ActorFor(r)} juga mengomentari jawaban pada: {title}");
        }

        public void RoleChanged(User target, User admin)
        {
            var role = target.Role switch { Roles.Guru => "Ustadz", Roles.Admin => "Admin", _ => "Anggota" };
            new Event(this, admin, null).Add(target, NotificationTypes.RoleChanged, $"Peranmu kini {role}", toAnswer: false, link: "/profile");
        }

        // Everyone presented as an ustadz: the Gurus and the Admins not hidden from the lists.
        private Task<List<User>> GurusAsync() => _db.Users.Ustadz().ToListAsync();

        private static string Short(string title)
        {
            var t = title.Trim();
            return t.Length <= TitleMax ? t : t[..TitleMax].TrimEnd() + "…";
        }

        // One event: its actor, subject and the people already told.
        private sealed class Event
        {
            private readonly Notifier _n;
            private readonly User _actor;
            private readonly Question? _question;
            private readonly Answer? _answer;
            private readonly HashSet<int> _told = new();

            public Event(Notifier notifier, User actor, Question? question, Answer? answer = null)
            {
                _n = notifier;
                _actor = actor;
                _question = question;
                _answer = answer;
                _told.Add(actor.Id);
            }

            // The actor as this recipient may see them.
            public string ActorFor(User recipient) =>
                _question != null && _question.IsAnonymous && _actor.Id == _question.UserId
                    && !QuestionVisibility.IsStaff(recipient) && recipient.Id != _question.UserId
                    ? QuestionVisibility.AnonymousName
                    : _actor.Name;

            private bool MayTell(User recipient)
            {
                if (_told.Contains(recipient.Id)) return false;
                // A private question (no consent) only reaches its asker and staff.
                if (_question != null && !_question.AllowPublish
                    && recipient.Id != _question.UserId && !QuestionVisibility.IsStaff(recipient)) return false;
                return true;
            }

            public void Add(User recipient, string type, string text, bool toAnswer = true, string? link = null)
            {
                if (!MayTell(recipient)) return;
                _told.Add(recipient.Id);
                _n._db.Notifications.Add(new Notification
                {
                    RecipientId = recipient.Id,
                    Type = type,
                    Actor = ActorFor(recipient),
                    Text = text,
                    Link = link,
                    Question = link == null ? _question : null,
                    Answer = link == null && toAnswer ? _answer : null,
                    CreatedAt = DateTime.UtcNow
                });
            }

            // Like Add, but folds into this recipient's unread notification of the same type
            // (and subject) if there is one, counting up instead of adding another row.
            public async Task Merge(User recipient, string type, int? subject, Func<int, string> text, string? link)
            {
                if (!MayTell(recipient)) return;
                var existing = await _n._db.Notifications.FirstOrDefaultAsync(x =>
                    x.RecipientId == recipient.Id && x.Type == type && x.ReadAt == null && x.QuestionId == subject);
                if (existing == null)
                {
                    Add(recipient, type, text(1), toAnswer: false, link: link);
                    return;
                }
                _told.Add(recipient.Id);
                existing.Count += 1;
                existing.Text = text(existing.Count);
                existing.Actor = ActorFor(recipient);
                existing.CreatedAt = DateTime.UtcNow;
            }
        }
    }
}

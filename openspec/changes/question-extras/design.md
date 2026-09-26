# Design

## Context

"Published" is spelled `x.Answers.Any()` in about eight places in
`QuestionController`:
- `GetQuestions`;
- three spots in `Browse`;
- `CanSee`.

`UstadzController.AnswerCountsAsync` counts answers on answered questions.

The asker's identity leaves the server in three shapes:
- `QuestionListItems.ToListItems()` (`userId`, `userName`, `userPicture`), used
  by every list;
- the anonymous object in `GetDetailQuestion`;
- comment rows in `AnswerController.GetComments`.

`GetComments` currently has no visibility check at all.

## Goals / Non-Goals

**Goals:**
- One definition of "published" and one masking rule, each written once and
  used everywhere, so a future list can't leak a private answer or an anonymous
  name by forgetting a condition.
- Existing data keeps its meaning: everything public today stays public.

**Non-Goals:**
- Changing the directed ustadz after asking.
- Notifying the chosen ustadz. That comes with WhatsApp notifications
  (roadmap 7).
- Reserving questions exclusively for one ustadz.

## Decisions

### Data model

`Question` gains:
- `IsAnonymous bool` (default false);
- `AllowPublish bool` (database default true, so the migration's `AddColumn`
  backfills existing rows as consented);
- `DirectedToId int?`, a foreign key to `Users` with ON DELETE SET NULL and a
  `DirectedTo` navigation.

A plain nullable foreign key was chosen over a join table: one ustadz per
question is all the canvas shows.

### "Published" as one expression

`Queries/QuestionVisibility.cs` holds:
- `public static readonly Expression<Func<Question, bool>> IsPublished = q => q.AllowPublish && q.Answers.Any();`
- `IQueryable<Question>.Published()`, an extension that applies it;
- `bool CanSee(Question, User?)`, which is `IsPublished` compiled, or the
  caller is the asker or staff.

Every current `Answers.Any()` that means "public" switches to `.Published()`:
- `GetQuestions`;
- the `Browse` index, the Guru facet source and `totalPublished`;
- `UstadzController.AnswerCountsAsync`.

The ones that mean "has an answer" stay as they are: the edit and delete 409
checks, `IsAnswered`, and the pending queue.

Rejected: sprinkling `&& q.AllowPublish` next to each `Answers.Any()`. That is
how a future list would leak.

### Masking at the edge, per caller

`ToListItems()` stays a pure projection and now also carries `IsAnonymous`,
`AllowPublish` and `DirectedTo`. A single `QuestionMask.Apply(item, viewer)`
runs over the materialised items before they are returned. For an anonymous
question, when the viewer is not the asker and not staff, it sets
`UserName = "Hamba Allah"` and nulls `UserId` and `UserPicture`.

- The detail endpoint builds its object through the same helper.
- `GetComments` loads the question's `UserId` and `IsAnonymous` once and masks
  comment rows whose `UserId` is the asker.
- `/mine` needs no masking, since the caller is the asker.

Masking in the SQL projection was considered. It would need the viewer inside
every expression and make `ToListItems()` caller-dependent. Masking the
materialised list is simpler, and lists are paged, so the cost is trivial.

`Browse` does need the viewer. It is anonymous-friendly today, so it now reads
the current user once, which is cheap: one lookup by Google id.

### Queue ordering

`?status=pending` orders by `DirectedToId == caller.Id` first, then newest
first. This is done in SQL (`OrderByDescending(x => x.DirectedToId == callerId)`).

### Directed-to validation

The server checks the id is a Guru at creation time. If that ustadz later stops
being a Guru, the question keeps pointing at them. The label still shows, and
any Guru can answer it anyway, so nothing breaks.

### Frontend

- **Ajukan Pertanyaan:**
  - It gets the select from `GET /api/ustadz`, which lists every Guru, and the
    two check boxes styled like the canvas's toggles: a check box plus a text
    line in a bordered row.
  - It reads `?ustadz=` for the preset.
- **Shared tags:** a `QuestionFlags` component renders the small tags (Anonim,
  Privat, Ditujukan kepada …) and is used in Pertanyaan saya, the queue and the
  question header.
- **Anonymous avatar:** a Hamba Allah asker is an `Avatar` with the name "Hamba
  Allah", which gives the initials "HA". Rejected: a special icon. The
  initials-avatar is already the neutral fallback everywhere.

## Risks / Trade-offs

- **[A missed call site leaks a private answer]** → The shared expression and
  `CanSee` cover every current site. The backend check lists each public
  endpoint and asserts a private answer is absent from it: list, browse, detail
  as anonymous, view, comments, and the ustadz count.
- **[Identity leaking through other data]** The answer author's own comments,
  and `userId` in the answer rows, are unaffected (they belong to the ustadz,
  not the asker). An anonymous asker who also *answers*, which is impossible
  for a User, isn't a case.
- **[Consent revoked after answering]** It isn't possible: consent is editable
  only while unanswered, like the title and body.

## Migration Plan

- An additive migration adds three columns, with `AllowPublish` defaulting to
  true and `IsAnonymous` to false. It runs on boot.
- Rollback: migrate back to `Articles`.

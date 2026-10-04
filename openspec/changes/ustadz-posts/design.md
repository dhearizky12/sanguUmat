# Design

## Context

A question belongs to its asker (`Question.UserId`), an answer to a Guru
(`Answer.UserId`). Lists and details credit "Ditanyakan oleh" the asker and
"Dijawab oleh" the answerer. Published means answered and `AllowPublish`
(`QuestionVisibility`). The answer queue is the unanswered questions. `Notifier`
is called by the controllers for each event. See proposal.md for the behaviour
asked for.

## Goals / Non-Goals

**Goals:**
- A post is an ordinary published question and answer in the data, so every list,
  facet, search, count, comment and admin tool keeps working without changes.
- One credit line in the UI, driven by one flag.

**Non-Goals:**
- Drafts or scheduled posts; posts are published at once.
- More than one answer on a post, or a different credit for question and answer.
- Recording which Admin posted on an ustadz's behalf.

## Decisions

**`Question.IsPost` plus the existing rows.** A post is a `Question` with
`IsPost = true`, `UserId` = the credited ustadz, `AllowPublish = true`,
`IsAnonymous = false`, no `DirectedToId`, and one `Answer` by the same ustadz.
No new table, no new column on `Answer`. Everything that reads "answered and
publishable" keeps working, the answer queue leaves posts out because they are
answered, and the credited ustadz appears in the ustadz facet and page because they
wrote the answer. *Alternative:* a separate `Post` table. Rejected: it would need
its own list, search, facets, comments and admin tools.

**Credit is `UserId`.** The one name shown is the question's `UserId` user, which
is also the answer's writer. An Admin choosing "Diposting atas nama" simply sets
both to that ustadz; the Admin leaves no trace. *Alternative:* store a separate
`PostedById`. Rejected for now: nothing needs it.

**Two endpoints, not new fields on the old ones.** `POST /api/question/post` and
`PUT /api/question/post/{id}` write the question and answer in one transaction.
The ordinary `POST /api/question` and `PUT /api/question/{id}` keep their rules
(asker only, unanswered only), so nobody can turn an ordinary question into a post
or back by accident. Validation messages are in Bahasa Indonesia.

**Posts are not answerable.** `POST /api/answer/{questionId}` returns 409 for a
post, so the post keeps a single answer and the single-credit label stays true.
The poster's answer edit goes through the post endpoint (the existing answer edit
still works for the writer, and is silent for posts).

**Deleting.** `DELETE /api/question/{id}` already removes a question and its
answers and comments. It gets one more allowed caller: the credited ustadz, for a
post, even though it is answered.

**Notifications stay silent.** The post endpoints never call `Notifier`. Three
existing calls need a guard so a post does not notify its own author:
`AnswerEdited` and `QuestionDeletedByAdmin` return early for `IsPost`, and for
`CommentPosted` the asker and the answer's writer are the same person, which the
existing "nobody is told twice" rule already reduces to one notification.

**`isPost` in the API.** List items (`/api/question`, `/browse`, `/mine`) and the
detail response gain `isPost`. `/mine` filters posts out. The frontend chooses the
label from `isPost`: `QuestionRow` shows "Diposting oleh {userName}", the detail
header shows it once and `AnswerItem` hides its "Dijawab oleh" line for a post.

**One form for create and edit.** A new `PostForm` page serves `/posting/baru` and
`/posting/{id}/ubah`, guarded for Guru and Admin. The Admin's "Diposting atas nama"
select uses the existing ustadz list. The header's ustadz menu gains "Tulis
Posting".

## Risks / Trade-offs

- A post answered by `AnswerController` before the 409 guard would break the single
  credit → the guard ships with the endpoint, and the task list tests it.
- `IsPost` is a flag read in several places (lists, detail, notifier, delete) →
  each is a one-line check, covered by the test script in the tasks.
- An Admin deleting an ustadz's post does not tell them → accepted; Admin tools
  are the only way to remove content and no message is sent for posts.
- Existing rows get `IsPost = false` by the migration default, so nothing changes
  for them.

## Migration Plan

1. Add `IsPost` (bool, default false) with an EF migration; it applies on boot.
2. Deploy the API (`git pull`, restart `sanguumat-api`) before uploading the UI,
   so the new fields exist when the UI asks for them.
3. Rollback: redeploy the previous build; the extra column is harmless.

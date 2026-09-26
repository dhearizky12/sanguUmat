# Design

## Context

- **Actions that notify** live in `QuestionController` (create, update,
  delete), `AnswerController` (answer create and update; comment create) and
  `AdminController` (role change).
- **Rules to respect:**
  - `QuestionVisibility` has `CanSee`, `SeesAsker` and the anonymous name.
  - The Npgsql retrying strategy rules out explicit transactions, so every
    write must be one `SaveChangesAsync`.
- **The header** already polls nothing but loads the pending count once per
  page for Gurus (`GET /api/question?status=pending`, a full list).

## Goals / Non-Goals

**Goals:**
- **Atomic:** a notification is saved in the same `SaveChangesAsync` as the
  action that causes it. There is no background queue, and no notification
  can exist for an action that failed.
- **One place for the rules:** who gets what, the privacy masking and merging
  all live in a single `Notifier` service, so controllers only say what
  happened.
- **Cheap polling:** the unread-count query is one indexed count.

**Non-Goals:**
- Delivery outside the app.
- Settings.
- Retention.
- Realtime push.

## Decisions

### Model

A `Notifications` table:

| Column | Notes |
| --- | --- |
| `Id` | |
| `RecipientId` | Foreign key to `Users`, CASCADE. |
| `Type` (short string) | For example `answer_posted`, `answer_edited`, `comment_on_question`, `comment_after_you`, `question_deleted`, `role_changed`, `question_directed`, `question_new`, `comment_on_answer`, `question_edited`. |
| `Actor` (display name, nullable) | |
| `Text` (≤ 300) | |
| `Link` (app path) | |
| `SubjectId` (int, nullable) | The question id, used for merging. |
| `Count` | Default 1. |
| `ReadAt` (nullable) | |
| `CreatedAt` | |

Indexes: (`RecipientId`, `ReadAt`) for the unread count, and (`RecipientId`,
`CreatedAt DESC`) for the list.

- **The text is stored rendered,** not rebuilt from ids at read time. A
  notification then reads the same even after the question's title changes or
  is deleted. That matters for the "deleted by Admin" case, where there is
  nothing left to join. The actor's name is stored already masked for that
  recipient.
- **Links are app paths** (for example `/question/detail/12#jawaban-40`) that the
  frontend routes through React Router, so the `/sanguumat` base path is
  handled by the router's basename.

### `Notifier`: a scoped service that stages rows on the DbContext

A controller calls, for example, `await notifier.AnswerPosted(question, answer,
actor)` before its own `SaveChangesAsync`. The notifier:
1. works out the recipients;
2. drops the actor and anyone already notified for this event (a per-call
   `HashSet<int>`, applied in rule order);
3. applies `CanSee` for private questions and the masking rule for anonymous
   askers;
4. adds or merges rows.

The controller's single save persists both the action and its notifications.

Rejected: EF `SaveChanges` interceptors or domain events. They are more
machinery than the handful of call sites needs, and they hide the "who gets
notified" logic from the code that causes it.

Rejected: a background job. It would lose atomicity and need infrastructure.

### Merging

For the `question_new` and `question_edited` types, the notifier first looks
for an unread row with the same recipient, type and (for edits) the same
`SubjectId`. If one exists, it increments `Count`, rewrites `Text` ("3
pertanyaan baru menunggu jawaban"), sets `CreatedAt` to now, and keeps the row
unread. Merges never touch read rows, so once someone has looked, the next
event starts fresh.

### Answer anchors

`AnswerItem` renders `<article id="jawaban-{id}">`. On the question page, after
the question loads, the page scrolls to `location.hash` if it matches an answer.
React Router does not do this on its own.

### Polling

`NotificationBell` keeps `unread` in state:
- It fetches `/unread-count` on mount, every 45 seconds while
  `document.visibilityState === "visible"`, and on `visibilitychange` and
  `focus`.
- Opening the panel fetches page 1 of the list, sliced to 8.
- Marking read updates the count optimistically.

A 45-second interval across a few hundred open tabs is a few requests a second,
each an indexed count, which is negligible.

### Time labels

`lib/timeAgo.js` produces "baru saja", "N menit lalu", "N jam lalu", "kemarin",
"N hari lalu", then a date.

## Risks / Trade-offs

- **[Fan-out]** "New question" and "question edited" notify every Guru: one row
  per Guru per event, merged while unread. At dozens of ustadz that is dozens of
  inserts per question, which is fine. The table grows with no pruning. →
  Retention is a later change; the indexes keep reads fast regardless.
- **[Stale text]** A notification keeps the title as it was when sent. →
  Intended, and it is what makes deleted-question notices readable.
- **[Missed call sites]** A future endpoint that answers or comments must call
  the notifier. → The notifier is the only way the tests (and the task list)
  create notifications, and each trigger has a backend check.

## Migration Plan

- An additive migration creates `Notifications`.
- Rollback: migrate back to `Kajian`.
- Nothing is backfilled: notifications start from deployment.

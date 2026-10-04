# Proposal

## Why

An ustadz sometimes gets a question offline (in person, in a group chat) and wants
to share the question and its answer with everyone. Today the only way in is for
someone to ask it as a user and for a Guru to answer it, which is awkward and
shows the wrong people as asker and answerer.

## What Changes

Touches **both backend and frontend**.

- A Guru or Admin can publish a question together with its answer in one step,
  from a dedicated page.
- These appear in the same Tanya Jawab list, search, category and ustadz facets,
  and ustadz pages as any answered question.
- They show one credit, "Diposting oleh {nama}", instead of "Ditanyakan oleh" and
  "Dijawab oleh", on cards and on the detail page.
- A Guru posts as themselves. An Admin picks which ustadz (a Guru) it is credited
  to; the Admin is never shown.
- No asker, no anonymity, no "ditujukan kepada". Published immediately.
- They never enter the answer queue and send no notifications.
- Every Jawaban box, on the question page, in its edit box and on the posting page, becomes
  the article's rich text editor. Existing answers stay plain text.
- The poster (or an Admin) can edit both texts and delete the post. Comments work
  as on any answer.
- Stored in the existing Question and Answer tables with a flag on `Question`.

API changes:

| Method | Path | Auth | Response |
| --- | --- | --- | --- |
| POST | `/api/question/post` | Guru or Admin | `201 { id }` |
| PUT | `/api/question/post/{id}` | the credited Guru, or Admin | `200` |
| GET | `/api/question`, `/browse`, `/{id}` | as before | each item and the detail gain `isPost` |
| POST | `/api/answer/{questionId}` | Guru | body gains `isHtml`; `409` when the question is a post |
| PUT | `/api/answer/{answerId}` | writer or Admin | body gains `isHtml` |
| DELETE | `/api/question/{id}` | as before, plus the credited Guru for a post | `200` |

New frontend pages: `/posting/baru` and `/posting/{id}/ubah` (Guru and Admin only).

## Capabilities

### New Capabilities

- `ustadz-posts`: publishing a question with its answer as an ustadz or Admin, how
  it is credited and listed, who may edit or delete it, and what it does not
  trigger.

### Modified Capabilities

- `answers`: answers can be written, edited and shown with formatting (`isHtml`).
- `questions`: reading a question carries `isPost`; the asker's own-questions list
  leaves posts out; an ustadz may delete their own post even though it is answered.

## Impact

- Backend: `Question` gains `IsPost` (migration, default false); a posts endpoint
  pair in `QuestionControllers.cs`; `QuestionListItems`, the detail response and
  `Notifier` guards; admin lists unchanged.
- Frontend: a new `PostForm` page, `QuestionRow`, `QuestionHeader`, `AnswerItem` and
  `Byline` credit lines, an entry in the header's ustadz menu, and edit/delete
  controls for the poster.
- Specs: new `ustadz-posts`; `questions` deltas.
- Data: existing rows are unaffected (`IsPost` false).

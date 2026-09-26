## Why

Every question is public the moment it is asked, answered or not. Tanya Jawab
therefore mixes finished answers with questions nobody has answered yet, and a
question that may never be answered — or that the asker would rather keep
private until it is — is visible to anyone with its link. The platform's value
is its ustadz-reviewed answers; only those should be published.

## What Changes

Both backend and frontend.

- **BREAKING:** `GET /api/question` (public) returns only answered questions,
  for every caller. Response shape unchanged.
- `?status=pending` on the same endpoint stays, for the Guru answer queue, but
  only for a Guru or an Admin; anyone else gets `403`. `?status=answered` is
  accepted and changes nothing.
- **BREAKING:** `GET /api/question/{id}` and `POST /api/question/{id}/view`
  answer `404` for an unanswered question unless the caller is its asker, a
  Guru or an Admin. Response shapes unchanged.
- `GET /api/question/mine` is unchanged: the asker still sees their unanswered
  questions in "Pertanyaan saya".
- Tanya Jawab loses its status filter and the "Terjawab / Menunggu jawaban" tag
  on each row; the Guru's "Jawab pertanyaan lain" sidebar asks for pending
  questions explicitly.
- The question page shows "Pertanyaan tidak ditemukan" for a question it may
  not show, instead of breaking.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `questions`: "Browsing questions" lists answered questions only and limits
  `status=pending` to Guru and Admin; "Reading a question" and "View counting"
  hide unanswered questions from everyone but the asker, Gurus and Admins.

## Impact

- Backend: `QuestionController` — `GetQuestions`, `GetQuestion`, `RecordView`.
- Frontend: `pages/Questions.jsx`, `components/QuestionCard.jsx`,
  `components/question/RelatedSidebar.jsx`, `pages/DetailQuestion.jsx`.
- The home page already asks for `status=answered` and the answer queue for
  `status=pending` as a Guru, so both keep working unchanged.

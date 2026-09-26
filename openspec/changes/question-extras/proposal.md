# Proposal

## Why

The Ajukan Pertanyaan canvas gives the asker three choices the app doesn't
offer yet:
- hide their name;
- decide whether the answer may be published for others;
- direct the question to a particular ustadz.

Religious questions are often personal: about family, health or money. Without
anonymity and consent, some people simply won't ask. Ustadz profiles
(roadmap 4) now exist, so there is someone to direct a question to.

## What Changes

Touches **both backend and frontend**.

- **Three new fields on a question:**
  - `isAnonymous` (default off);
  - `allowPublish` (default on; every existing question counts as consented);
  - `directedToId` (optional, a Guru).
- **Anonymous questions:**
  - Everyone except the asker, Gurus and Admins sees "Hamba Allah" with a
    neutral avatar and no user id, everywhere the asker appears: lists, the
    question page, and the asker's own comments on that question's answers.
  - Gurus and Admins see the real name, marked "anonim".
- **Published now means answered *and* consented.** A question whose asker did
  not consent is still answered normally, but it never appears in:
  - Tanya Jawab, browse or search, or the home page lists;
  - an ustadz's page, or their answer count.
  
  Only the asker, Gurus and Admins can open it. Its answers' comments follow the
  same rule. **BREAKING** for any client that assumed "answered = public" (only
  our own frontend).
- **Directed questions:** a question can be addressed to one ustadz. It tops
  that ustadz's queue as "Ditujukan kepada Anda". Other Gurus see "Ditujukan
  kepada {name}" and may still answer, so no question gets stuck.
- **Ajukan Pertanyaan form:**
  - adds "Ditujukan kepada" (opsional, "Ustadz mana saja") and the two
    checkboxes from the canvas;
  - an ustadz's page gets "Tanya ustadz ini", which opens the form with that
    ustadz chosen.
- **Editing:** the asker can change the anonymous and consent choices while the
  question is unanswered, the same window in which the title and body can be
  edited.
- **"Pertanyaan saya"** shows each question's choices: Anonim, Privat,
  Ditujukan kepada ….

### New and changed endpoints

| Method | Path | Auth | Change |
| --- | --- | --- | --- |
| POST | `/api/question` | signed in | Body adds `isAnonymous`, `allowPublish` and `directedTo` (a Guru's id). An id that isn't a Guru answers 400 "Ustadz yang dipilih tidak tersedia". |
| PUT | `/api/question/{id}` | asker, unanswered | Body adds `isAnonymous` and `allowPublish`. When those are omitted, the stored values are kept. |
| GET | `/api/question`, `/browse`, `/mine`, `/{id}` | as before | Items add `isAnonymous`, `allowPublish` and `directedTo: { id, name } \| null`. For an anonymous question seen by someone other than its asker, a Guru or an Admin, `userName` is "Hamba Allah" and `userId` and `userPicture` are null. Public lists and detail require consent. |
| GET | `/api/question?status=pending` | Guru or Admin | Items directed to the caller come first. |
| GET | `/api/answer/{id}/comments` | anyone who may see the question | 404 when the caller may not see the question. The asker's comments on an anonymous question are masked the same way. |
| GET | `/api/ustadz`, `/api/ustadz/{id}` | none | `answerCount` counts published questions only. |

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `questions`: asking takes the three choices. Browsing, reading and view
  counting use the new definition of published. Anonymous masking. Editing takes
  the two choices.
- `question-browsing`: the browse endpoint lists only consented, answered
  questions.
- `answers`: the queue puts questions directed to the caller first and shows who
  a question is directed to.
- `answer-comments`: reading comments follows the question's visibility and
  masks an anonymous asker.

## Impact

- **Backend:**
  - `Question` model and a migration: two booleans and a nullable foreign key to
    `Users`, ON DELETE SET NULL.
  - `QuestionController`, `QuestionListItems`, `AnswerController`
    (comments) and `UstadzController` (answer counts).
  - Request DTOs.
- **Frontend:**
  - `CreateQuestion`, `MyQuestions`, `QuestionHeader` (edit form and asker
    display), `QuestionCard` / dashboard list items, `CommentSection`,
    `AnswerQueue` and `UstadzDetail` ("Tanya ustadz ini").
- **Data:**
  - Existing questions get `allowPublish = true` and `isAnonymous = false`, so
    nothing that is public today disappears.
- **Out of scope:**
  - the review workflow and ticket numbers (roadmap 8);
  - quota (roadmap 9);
  - WhatsApp notifications (roadmap 7);
  - reserving a question exclusively for one ustadz.

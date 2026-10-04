## Purpose

The questions people ask — asking, browsing, searching and filtering them,
reading one in detail, and the limits on editing or deleting a question once it
has been answered.

## Requirements

### Requirement: Asking a question

A signed-in user MUST be able to ask a question with a title, a body, an
optional category, an optional ustadz it is directed to, whether to appear
anonymously, and whether its answer may be published.

#### Scenario: Creating a question

- **WHEN** a signed-in user posts `{ title, content, category?, directedTo?,
  isAnonymous?, allowPublish? }` to `POST /api/question`
- **THEN** the question is stored against them with `CreatedAt` set to now and
  `Views` at 0
- **AND** `isAnonymous` defaults to false and `allowPublish` to true when
  omitted

#### Scenario: Directing a question to an ustadz

- **WHEN** `directedTo` is the id of an ustadz (a Guru, or an Admin who is not hidden as an ustadz)
- **THEN** the question is stored as directed to that ustadz
- **WHEN** `directedTo` is the id of anyone who is not an ustadz, or of nobody
- **THEN** the response is 400 with "Ustadz yang dipilih tidak tersedia" and
  nothing is stored

#### Scenario: Unrecognised or omitted category

- **WHEN** the posted category is absent, or is not one of the known categories
- **THEN** the question is still created, with no category
- **AND** the UI labels it "Lainnya"

#### Scenario: Anonymous caller

- **WHEN** an unauthenticated caller posts to `POST /api/question`
- **THEN** the response is 401 and nothing is stored

#### Scenario: The Ajukan Pertanyaan form

- **WHEN** a signed-in user opens Ajukan Pertanyaan
- **THEN** below the category the form offers "Ditujukan kepada" (opsional),
  listing "Ustadz mana saja" and every ustadz
- **AND** below the body two check boxes: "Tampilkan sebagai anonim. Nama saya
  disembunyikan dari halaman publik." (off) and "Jawaban boleh ditayangkan di
  Tanya Jawab agar bermanfaat bagi jamaah lain." (on)
- **WHEN** the form is opened as `/question/create?ustadz={id}`
- **THEN** that ustadz is already chosen
- **AND** an ustadz's page offers "Tanya ustadz ini", which opens it that way

### Requirement: Published questions

A question MUST be published — shown to everyone — only when it has at least
one answer and its asker allowed publishing. Every other question MUST be
visible only to its asker, Gurus and Admins.

#### Scenario: Answered with consent

- **WHEN** a question has an answer and `allowPublish` is true
- **THEN** it is published

#### Scenario: Answered without consent

- **WHEN** a question has an answer and `allowPublish` is false
- **THEN** it is a private answer: it never appears in Tanya Jawab, browse,
  search, the home page or an ustadz's page, and does not count towards an
  ustadz's `answerCount`
- **AND** it is readable only by its asker, Gurus and Admins, and marked
  "Privat" for them

#### Scenario: Existing questions

- **WHEN** the change is deployed
- **THEN** every existing question has `allowPublish` true and `isAnonymous`
  false, so nothing published before disappears

### Requirement: Anonymous askers

An anonymous question MUST NOT reveal its asker to anyone except the asker,
Gurus and Admins.

#### Scenario: Seen by the public

- **WHEN** anyone other than the asker, a Guru or an Admin receives an anonymous
  question, in a list or in detail
- **THEN** `userName` is "Hamba Allah", and `userId` and `userPicture` are null
- **AND** the UI shows "Hamba Allah" with a neutral avatar wherever the asker
  would appear

#### Scenario: Seen by the asker, a Guru or an Admin

- **WHEN** the asker, a Guru or an Admin receives it
- **THEN** the real name, id and picture are returned with `isAnonymous` true
- **AND** the UI shows the real name marked "anonim"

### Requirement: Browsing questions

Anyone, signed in or not, MUST be able to list the published questions newest
first, and narrow them by free text and category. Unpublished questions MUST be
listed only for a Guru or an Admin, and only while unanswered, for answering.

#### Scenario: Listing

- **WHEN** anyone requests `GET /api/question`
- **THEN** every published question is returned newest first, and no other
  question is
- **AND** each carries `id`, `title`, `content`, `createdAt`, `views`,
  `category`, `userId`, `userName`, `userPicture`, `isAnswered`,
  `commentCount`, `isAnonymous`, `allowPublish`, `directedTo` (`{ id, name }` or
  `null`), and `answeredBy` / `answeredByRole` / `answeredByPicture` — the name,
  role and picture of the answer shown for it (an ustadz's answer when there is
  one, otherwise the first), or `null` when unanswered
- **AND** the asker fields are masked as described under Anonymous askers

#### Scenario: Free-text search

- **WHEN** `?search=` is given
- **THEN** only questions whose title or body contains it are returned, matched
  case-insensitively

#### Scenario: Filtering by answered status

- **WHEN** `?status=answered` is given
- **THEN** the result is the same as with no status: published questions only
- **WHEN** a Guru or an Admin gives `?status=pending`
- **THEN** only questions with no answers are returned, whatever their consent,
  those directed to the caller first, then newest first
- **WHEN** anyone else gives `?status=pending`
- **THEN** the response is 403

#### Scenario: Filtering by category

- **WHEN** `?category=` is given
- **THEN** only questions in that category are returned

#### Scenario: Combining filters

- **WHEN** several of `search`, `status` and `category` are given together
- **THEN** all of them apply

#### Scenario: Tanya Jawab shows answered questions only

- **WHEN** anyone opens Tanya Jawab
- **THEN** only published questions are listed, with no status filter and no
  answered/waiting tag on the rows
- **AND** each row shows its category at top left and, at top right, its date
  with its view and comment counts as icons; at the bottom, level across the
  row, who asked it on the left (avatar, "Ditanyakan" above the name, "Hamba
  Allah" for an anonymous asker) and who answered it on the right ("Dijawab"
  above the name, with the answerer's avatar carrying a small gold verified mark
  for an ustadz)

### Requirement: Own questions

A signed-in user MUST be able to list the questions they asked, with the
choices they made for each. Posts credited to them as an ustadz are not
questions they asked and are left out.

#### Scenario: Listing own questions

- **WHEN** a signed-in user requests `GET /api/question/mine`
- **THEN** all their own questions are returned, published or not, newest
  first, in the same shape as the main listing and unmasked
- **AND** posts credited to them (`isPost`) are not included

#### Scenario: Pertanyaan saya

- **WHEN** the asker views their questions on Ajukan Pertanyaan
- **THEN** each shows "Anonim" when anonymous, "Privat" when publishing is not
  allowed, and "Ditujukan kepada {name}" when directed

### Requirement: Reading a question

Anyone MUST be able to read a published question in full, with its answers
newest first. Any other question MUST be readable only by its asker, a Guru or
an Admin.

#### Scenario: Reading detail

- **WHEN** anyone requests `GET /api/question/{id}` for a published question
- **THEN** the response carries the question's `id`, `title`, `content`,
  `createdAt`, `views`, `category`, `userId`, `isAnonymous`, `allowPublish`,
  `isPost` and `directedTo`, its author's `userName` and `userPicture` (masked as
  described under Anonymous askers), and `answers` newest first
- **AND** each answer carries `id`, `content`, `createdAt`, `userId`,
  `userName`, `userPicture`, the author's `role`, and `commentCount`

#### Scenario: Unanswered question for the asker, a Guru or an Admin

- **WHEN** the asker, a Guru or an Admin requests an unanswered question or a
  private answer
- **THEN** it is returned the same way, with its answers if any
- **AND** the question page marks a private answer "Privat — tidak ditayangkan
  di Tanya Jawab"

#### Scenario: Unanswered question for anyone else

- **WHEN** anyone else — signed out, or signed in as another user — requests an
  unanswered question or a private answer
- **THEN** the response is 404, the same as for a question that does not exist
- **AND** the question page shows "Pertanyaan tidak ditemukan" with a link back
  to Tanya Jawab

#### Scenario: Unknown question

- **WHEN** the id matches nothing
- **THEN** the response is 404

#### Scenario: Reading does not count a view

- **WHEN** `GET /api/question/{id}` is called
- **THEN** `views` is left unchanged

#### Scenario: Directed question

- **WHEN** a directed question is shown on its page
- **THEN** it reads "Ditujukan kepada {name}", linking to the ustadz's page

#### Scenario: A post

- **WHEN** the question is a post (`isPost`)
- **THEN** its page credits it with "Diposting oleh {name}", as described in
  `ustadz-posts`, and has no "Ditanyakan oleh" line

### Requirement: View counting

A question MUST count one view per real visit to its page, and MUST NOT count
views from listing or batch fetches, or from callers who may not see it.

#### Scenario: Recording a view

- **WHEN** `POST /api/question/{id}/view` is called for a question the caller
  may read
- **THEN** `Views` increases by one and `{ views }` is returned

#### Scenario: A question the caller may not read

- **WHEN** `POST /api/question/{id}/view` is called for an unpublished question
  by anyone other than its asker, a Guru or an Admin
- **THEN** the response is 404 and `Views` is unchanged

#### Scenario: Only the detail page counts

- **WHEN** a page other than the question detail page fetches a question
- **THEN** it does not call the view endpoint

### Requirement: Editing a question

Only the author MAY edit their question, and only while it has no answers.
Editing is not a moderation action, so Admins are deliberately excluded.

#### Scenario: Author edits an unanswered question

- **WHEN** the author sends `{ title, content, isAnonymous?, allowPublish? }` to
  `PUT /api/question/{id}` and the question has no answers
- **THEN** the title and body are updated, and so are the anonymous and consent
  choices when given; omitted choices keep their stored values
- **AND** the edit form on the question page offers the same two check boxes as
  Ajukan Pertanyaan

#### Scenario: Someone else tries to edit

- **WHEN** any user other than the author attempts the edit, Admins included
- **THEN** the response is 403 and nothing changes

#### Scenario: Editing an answered question

- **WHEN** the author attempts the edit and the question already has an answer
- **THEN** the response is 409 and nothing changes

### Requirement: Deleting a question

Deleting MUST follow these rules. The author MAY delete their own question while it has no answers. An Admin MAY
delete any question at any time, so moderation is never blocked. The credited
ustadz MAY delete their own post at any time, since a post is answered from the
start.

#### Scenario: Author deletes an unanswered question

- **WHEN** the author sends `DELETE /api/question/{id}` and it has no answers
- **THEN** the question is deleted

#### Scenario: Author cannot delete an answered question

- **WHEN** the author attempts the delete and the question has an answer and is
  not a post
- **THEN** the response is 409 and nothing is deleted

#### Scenario: Ustadz deletes their post

- **WHEN** the credited ustadz sends `DELETE /api/question/{id}` for their post
- **THEN** the post, its answer and the answer's comments are deleted

#### Scenario: Admin moderation

- **WHEN** an Admin sends `DELETE /api/question/{id}`
- **THEN** the question is deleted whether or not it has answers

#### Scenario: Anyone else

- **WHEN** a user who is neither the author nor an Admin attempts the delete
- **THEN** the response is 403

## MODIFIED Requirements

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

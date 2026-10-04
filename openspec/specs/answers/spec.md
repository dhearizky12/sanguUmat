## Purpose

Answers to questions. Only verified teachers may answer, which is what makes an
answer on the platform worth trusting.

## Requirements

### Requirement: Answering is restricted to Guru

Only a user whose role is `Guru` MAY answer a question.

#### Scenario: Guru answers

- **WHEN** a signed-in `Guru` posts `{ content }` to
  `POST /api/answer/{questionId}`
- **THEN** the answer is stored against them and that question, with `CreatedAt`
  set to now

#### Scenario: Non-Guru attempts to answer

- **WHEN** a signed-in `User` or `Admin` posts to `POST /api/answer/{questionId}`
- **THEN** the response is 403 and nothing is stored

#### Scenario: Anonymous caller

- **WHEN** an unauthenticated caller posts an answer
- **THEN** the response is 401

#### Scenario: Unknown question

- **WHEN** a `Guru` answers a question id that matches nothing
- **THEN** the response is 404

### Requirement: Editing an answer

The answer's author MAY edit it. An Admin MAY also edit any answer, as
moderation.

#### Scenario: Author edits

- **WHEN** the answer's author sends `{ content }` to `PUT /api/answer/{answerId}`
- **THEN** the body is updated

#### Scenario: Admin edits

- **WHEN** an Admin sends the same request for someone else's answer
- **THEN** the body is updated

#### Scenario: Anyone else

- **WHEN** a user who is neither the author nor an Admin attempts the edit
- **THEN** the response is 403

### Requirement: Deleting an answer

The answer's author MAY delete it. An Admin MAY delete any answer.

#### Scenario: Author deletes

- **WHEN** the answer's author sends `DELETE /api/answer/{answerId}`
- **THEN** the answer is deleted

#### Scenario: Admin deletes

- **WHEN** an Admin sends the same request for someone else's answer
- **THEN** the answer is deleted

#### Scenario: Anyone else

- **WHEN** a user who is neither the author nor an Admin attempts the delete
- **THEN** the response is 403

### Requirement: Answer queue for Guru

A `Guru` MUST be able to see the questions still waiting for an answer, and how
many there are, with the questions directed to them first.

#### Scenario: Pending count in the header

- **WHEN** a signed-in `Guru` loads any page
- **THEN** the header shows how many questions are unanswered
- **AND** the count is not shown to any other role

#### Scenario: Working the queue

- **WHEN** a `Guru` opens the answer queue
- **THEN** they see the unanswered questions and can answer them
- **AND** each question card has a "Jawab" button, which opens the question
  scrolled to "Tulis jawaban" with the cursor in the box

#### Scenario: Directed questions

- **WHEN** a question in the queue is directed to the Guru viewing it
- **THEN** it is listed before the others and marked "Ditujukan kepada Anda"
- **WHEN** it is directed to another ustadz
- **THEN** it keeps its place and is marked "Ditujukan kepada {name}"
- **AND** any Guru may still answer it

#### Scenario: Private and anonymous in the queue

- **WHEN** a queued question is anonymous or does not allow publishing
- **THEN** it is marked "Anonim" or "Privat" so the ustadz knows before
  answering

### Requirement: Formatted answers

An answer MUST be writable with formatting (headings, bold, italic, underline,
strikethrough, quotes, lists, rules and links) wherever an answer is written, and
MUST be shown as written. Answers written before this stay plain text and show as
they always did.

#### Scenario: Writing a formatted answer

- **WHEN** a Guru posts `{ content, isHtml: true }` to
  `POST /api/answer/{questionId}`
- **THEN** the content is stored cleaned to the same allowed formatting as an
  article body, and the answer is marked `isHtml`
- **AND** anything outside that formatting, such as scripts, styles or other
  attributes, is removed

#### Scenario: Plain by default

- **WHEN** `isHtml` is omitted
- **THEN** the content is stored as plain text, exactly as before

#### Scenario: Empty answer

- **WHEN** the content is empty, only whitespace, or formatting with no text
- **THEN** the response is 400 with "Jawaban tidak boleh kosong" and nothing is
  stored

#### Scenario: Editing

- **WHEN** the answer's writer or an Admin sends `{ content, isHtml: true }` to
  `PUT /api/answer/{answerId}`
- **THEN** the answer is updated and cleaned the same way
- **AND** the edit box on the question page opens with the answer's formatting;
  for a plain answer it opens with its lines as paragraphs, and saving makes it a
  formatted answer

#### Scenario: Reading

- **WHEN** a question is read
- **THEN** each answer carries `isHtml`
- **AND** a formatted answer is shown with its formatting, in the same type as an
  article, and a plain answer as before

#### Scenario: The editor

- **WHEN** a Guru writes or edits an answer on the question page, or an ustadz writes
  a post's "Jawaban"
- **THEN** the box is the article editor, with its toolbar, under the label "Tulis
  jawaban", "Ubah jawaban" or "Jawaban"

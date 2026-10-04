## ADDED Requirements

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

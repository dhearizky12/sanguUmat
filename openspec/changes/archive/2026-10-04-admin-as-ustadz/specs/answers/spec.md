## RENAMED Requirements

- FROM: `### Requirement: Answering is restricted to Guru`
- TO: `### Requirement: Answering is for Guru and Admin`
- FROM: `### Requirement: Answer queue for Guru`
- TO: `### Requirement: Answer queue for Guru and Admin`

## MODIFIED Requirements

### Requirement: Answering is for Guru and Admin

Answering MUST be limited to users whose role is `Guru` or `Admin`; an Admin
answers as themselves, like a Guru.

#### Scenario: Guru answers

- **WHEN** a signed-in `Guru` or `Admin` posts `{ content }` to
  `POST /api/answer/{questionId}`
- **THEN** the answer is stored against them and that question, with `CreatedAt`
  set to now

#### Scenario: Non-Guru attempts to answer

- **WHEN** a signed-in `User` posts to `POST /api/answer/{questionId}`
- **THEN** the response is 403 and nothing is stored

#### Scenario: Anonymous caller

- **WHEN** an unauthenticated caller posts an answer
- **THEN** the response is 401

#### Scenario: Unknown question

- **WHEN** a `Guru` or `Admin` answers a question id that matches nothing
- **THEN** the response is 404

### Requirement: Answer queue for Guru and Admin

A `Guru` or an `Admin` MUST be able to see the questions still waiting for an answer, and how
many there are, with the questions directed to them first.

#### Scenario: Pending count in the header

- **WHEN** a signed-in `Guru` or `Admin` loads any page
- **THEN** the header shows how many questions are unanswered
- **AND** the count is not shown to any other role

#### Scenario: Working the queue

- **WHEN** a `Guru` or an `Admin` opens the answer queue
- **THEN** they see the unanswered questions and can answer them
- **AND** each question card has a "Jawab" button, which opens the question
  scrolled to "Tulis jawaban" with the cursor in the box

#### Scenario: Directed questions

- **WHEN** a question in the queue is directed to the ustadz viewing it
- **THEN** it is listed before the others and marked "Ditujukan kepada Anda"
- **WHEN** it is directed to another ustadz
- **THEN** it keeps its place and is marked "Ditujukan kepada {name}"
- **AND** any Guru or Admin may still answer it

#### Scenario: Private and anonymous in the queue

- **WHEN** a queued question is anonymous or does not allow publishing
- **THEN** it is marked "Anonim" or "Privat" so the ustadz knows before
  answering

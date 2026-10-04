## MODIFIED Requirements

### Requirement: Answer queue for Guru and Admin

A `Guru` or an `Admin` MUST be able to see the questions still waiting for an answer, and how
many there are, with the questions directed to them first.

#### Scenario: Pending count in the header

- **WHEN** a signed-in `Guru` or `Admin` loads any page
- **THEN** "Jawab Pertanyaan" shows how many questions are unanswered, whether it is a
  button in the header or an item in the account menu (see `site-header`)
- **AND** when it is in the account menu the count also sits on the avatar
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

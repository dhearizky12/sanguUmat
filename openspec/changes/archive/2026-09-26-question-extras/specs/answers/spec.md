## MODIFIED Requirements

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

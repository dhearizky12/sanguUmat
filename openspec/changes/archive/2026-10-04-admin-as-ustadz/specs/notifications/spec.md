## MODIFIED Requirements

### Requirement: Ustadz events

An ustadz MUST be notified about questions addressed to them, new work in the
queue, and follow-ups under their answers.

#### Scenario: Directed question

- **WHEN** a question is asked with `directedTo` set to an ustadz
- **THEN** that ustadz is notified: "{asker} mengajukan pertanyaan untukmu:
  {title}", linking to the question

#### Scenario: New question in the queue

- **WHEN** a question is asked
- **THEN** every ustadz other than the directed one is notified, linking to Jawab
  Pertanyaan
- **AND** an ustadz who already has an unread new-question notification has that
  one updated instead: its count goes up by one, its text reads "{N}
  pertanyaan baru menunggu jawaban", and its time becomes now

#### Scenario: Comment on their answer

- **WHEN** anyone comments on an answer
- **THEN** the answer's writer is notified: "{actor} mengomentari jawabanmu
  pada: {title}", linking to the answer

#### Scenario: Unanswered question edited

- **WHEN** the asker edits a question that has no answers
- **THEN** the directed ustadz, or every ustadz when it is not directed, is
  notified: "{asker} mengubah pertanyaan: {title}", linking to the question
- **AND** an unread edit notification for the same question is updated instead
  of adding another

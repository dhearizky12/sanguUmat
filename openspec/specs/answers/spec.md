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
many there are.

#### Scenario: Pending count in the header

- **WHEN** a signed-in `Guru` loads any page
- **THEN** the header shows how many questions are unanswered
- **AND** the count is not shown to any other role

#### Scenario: Working the queue

- **WHEN** a `Guru` opens the answer queue
- **THEN** they see the unanswered questions and can answer them

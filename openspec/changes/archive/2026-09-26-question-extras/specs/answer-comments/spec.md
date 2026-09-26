## MODIFIED Requirements

### Requirement: Reading comments

Anyone who may see a question MUST be able to read the comments on its answers,
oldest first. Nobody else may.

#### Scenario: Listing comments

- **WHEN** anyone requests `GET /api/answer/{answerId}/comments` for an answer
  on a question they may see
- **THEN** the comments are returned oldest first
- **AND** each carries `id`, `content`, `createdAt`, `userId`, `userName` and
  `userPicture`

#### Scenario: A question the caller may not see

- **WHEN** the answer belongs to a private answer and the caller is not its
  asker, a Guru or an Admin
- **THEN** the response is 404

#### Scenario: The anonymous asker's comments

- **WHEN** the question is anonymous and a comment is by its asker
- **THEN** that comment is masked like the question: "Hamba Allah", with
  `userId` and `userPicture` null, for everyone except the asker, Gurus and
  Admins

### Requirement: Writing a comment

Any signed-in user who may see a question MAY comment on its answers, whatever
their role.

#### Scenario: Posting a comment

- **WHEN** a signed-in user posts `{ content }` to
  `POST /api/answer/{answerId}/comments`
- **THEN** the comment is stored against them and that answer
- **AND** the created comment is returned, so the UI can show it without
  refetching the list

#### Scenario: Anonymous caller

- **WHEN** an unauthenticated caller posts a comment
- **THEN** the response is 401

#### Scenario: Unknown answer

- **WHEN** the answer id matches nothing, or belongs to a private answer the
  caller may not see
- **THEN** the response is 404

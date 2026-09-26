## Purpose

Discussion underneath an answer. Unlike answering, commenting is open to every
signed-in user, so askers can follow up on what a teacher said.

## Requirements

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

### Requirement: Deleting a comment

The comment's author MAY delete it. An Admin MAY delete any comment.

#### Scenario: Author deletes

- **WHEN** the comment's author sends
  `DELETE /api/answer/{answerId}/comments/{commentId}`
- **THEN** the comment is deleted

#### Scenario: Admin deletes

- **WHEN** an Admin sends the same request for someone else's comment
- **THEN** the comment is deleted

#### Scenario: Anyone else

- **WHEN** a user who is neither the author nor an Admin attempts the delete
- **THEN** the response is 403

#### Scenario: Mismatched answer

- **WHEN** the comment id exists but does not belong to the given answer
- **THEN** the response is 404

### Requirement: Comment counts

Question listings and answers MUST carry a comment count, so the UI can show how
much discussion a question drew without fetching the comments.

#### Scenario: Count on a question

- **WHEN** a question is listed
- **THEN** `commentCount` is the total comments across all of its answers

#### Scenario: Count on an answer

- **WHEN** a question's detail is read
- **THEN** each answer carries its own `commentCount`

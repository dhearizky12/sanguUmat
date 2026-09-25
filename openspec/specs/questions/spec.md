## Purpose

The questions people ask — asking, browsing, searching and filtering them,
reading one in detail, and the limits on editing or deleting a question once it
has been answered.

## Requirements

### Requirement: Asking a question

A signed-in user MUST be able to ask a question with a title, a body and an
optional category.

#### Scenario: Creating a question

- **WHEN** a signed-in user posts `{ title, content, category? }` to
  `POST /api/question`
- **THEN** the question is stored against them with `CreatedAt` set to now and
  `Views` at 0

#### Scenario: Unrecognised or omitted category

- **WHEN** the posted category is absent, or is not one of the known categories
- **THEN** the question is still created, with no category
- **AND** the UI labels it "Lainnya"

#### Scenario: Anonymous caller

- **WHEN** an unauthenticated caller posts to `POST /api/question`
- **THEN** the response is 401 and nothing is stored

### Requirement: Browsing questions

Anyone, signed in or not, MUST be able to list questions, newest first, and
narrow them by free text, answered status and category.

#### Scenario: Listing

- **WHEN** anyone requests `GET /api/question`
- **THEN** every question is returned newest first
- **AND** each carries `id`, `title`, `content`, `createdAt`, `views`,
  `category`, `userId`, `userName`, `userPicture`, `isAnswered` and
  `commentCount`

#### Scenario: Free-text search

- **WHEN** `?search=` is given
- **THEN** only questions whose title or body contains it are returned, matched
  case-insensitively

#### Scenario: Filtering by answered status

- **WHEN** `?status=answered` is given
- **THEN** only questions with at least one answer are returned
- **WHEN** `?status=pending` is given
- **THEN** only questions with no answers are returned

#### Scenario: Filtering by category

- **WHEN** `?category=` is given
- **THEN** only questions in that category are returned

#### Scenario: Combining filters

- **WHEN** several of `search`, `status` and `category` are given together
- **THEN** all of them apply

### Requirement: Own questions

A signed-in user MUST be able to list the questions they asked.

#### Scenario: Listing own questions

- **WHEN** a signed-in user requests `GET /api/question/mine`
- **THEN** only their own questions are returned, newest first, in the same
  shape as the main listing

### Requirement: Reading a question

Anyone MUST be able to read a question in full, with its answers newest first.

#### Scenario: Reading detail

- **WHEN** anyone requests `GET /api/question/{id}`
- **THEN** the response carries the question's `id`, `title`, `content`,
  `createdAt`, `views`, `category` and `userId`, its author's `userName` and
  `userPicture`, and `answers` newest first
- **AND** each answer carries `id`, `content`, `createdAt`, `userId`,
  `userName`, `userPicture`, the author's `role`, and `commentCount`

#### Scenario: Unknown question

- **WHEN** the id matches nothing
- **THEN** the response is 404

#### Scenario: Reading does not count a view

- **WHEN** `GET /api/question/{id}` is called
- **THEN** `views` is left unchanged

### Requirement: View counting

A question MUST count one view per real visit to its page, and MUST NOT count
views from listing or batch fetches.

#### Scenario: Recording a view

- **WHEN** `POST /api/question/{id}/view` is called
- **THEN** `Views` increases by one and `{ views }` is returned

#### Scenario: Only the detail page counts

- **WHEN** a page other than the question detail page fetches a question
- **THEN** it does not call the view endpoint

### Requirement: Editing a question

Only the author MAY edit their question, and only while it has no answers.
Editing is not a moderation action, so Admins are deliberately excluded.

#### Scenario: Author edits an unanswered question

- **WHEN** the author sends `{ title, content }` to `PUT /api/question/{id}`
  and the question has no answers
- **THEN** the title and body are updated

#### Scenario: Someone else tries to edit

- **WHEN** any user other than the author attempts the edit, Admins included
- **THEN** the response is 403 and nothing changes

#### Scenario: Editing an answered question

- **WHEN** the author attempts the edit and the question already has an answer
- **THEN** the response is 409 and nothing changes

### Requirement: Deleting a question

The author MAY delete their own question while it has no answers. An Admin MAY
delete any question at any time, so moderation is never blocked.

#### Scenario: Author deletes an unanswered question

- **WHEN** the author sends `DELETE /api/question/{id}` and it has no answers
- **THEN** the question is deleted

#### Scenario: Author cannot delete an answered question

- **WHEN** the author attempts the delete and the question has an answer
- **THEN** the response is 409 and nothing is deleted

#### Scenario: Admin moderation

- **WHEN** an Admin sends `DELETE /api/question/{id}`
- **THEN** the question is deleted whether or not it has answers

#### Scenario: Anyone else

- **WHEN** a user who is neither the author nor an Admin attempts the delete
- **THEN** the response is 403

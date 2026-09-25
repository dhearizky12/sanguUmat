## MODIFIED Requirements

### Requirement: Browsing questions

Anyone, signed in or not, MUST be able to list the published questions — those
with at least one answer — newest first, and narrow them by free text and
category. Unanswered questions MUST be listed only for a Guru or an Admin, who
answer them.

#### Scenario: Listing

- **WHEN** anyone requests `GET /api/question`
- **THEN** every question with at least one answer is returned newest first,
  and no unanswered question is
- **AND** each carries `id`, `title`, `content`, `createdAt`, `views`,
  `category`, `userId`, `userName`, `userPicture`, `isAnswered`,
  `commentCount`, and `answeredBy` / `answeredByRole` / `answeredByPicture` — the name, role and picture of the
  answer shown for it (a Guru's answer when there is one, otherwise the first),
  or `null` when unanswered

#### Scenario: Free-text search

- **WHEN** `?search=` is given
- **THEN** only questions whose title or body contains it are returned, matched
  case-insensitively

#### Scenario: Filtering by answered status

- **WHEN** `?status=answered` is given
- **THEN** the result is the same as with no status: answered questions only
- **WHEN** a Guru or an Admin gives `?status=pending`
- **THEN** only questions with no answers are returned
- **WHEN** anyone else gives `?status=pending`
- **THEN** the response is 403

#### Scenario: Filtering by category

- **WHEN** `?category=` is given
- **THEN** only questions in that category are returned

#### Scenario: Combining filters

- **WHEN** several of `search`, `status` and `category` are given together
- **THEN** all of them apply

#### Scenario: Tanya Jawab shows answered questions only

- **WHEN** anyone opens Tanya Jawab
- **THEN** only answered questions are listed, with no status filter and no
  answered/waiting tag on the rows
- **AND** each row shows its category at top left and, at top right, its date
  with its view and comment counts as icons; at the bottom, level across the
  row, who asked it on the left (avatar, "Ditanyakan" above the name) and who
  answered it on the right ("Dijawab" above the name, with the answerer's
  avatar carrying a small gold verified mark for a Guru)

### Requirement: Reading a question

Anyone MUST be able to read an answered question in full, with its answers
newest first. An unanswered question MUST be readable only by its asker, a
Guru or an Admin.

#### Scenario: Reading detail

- **WHEN** anyone requests `GET /api/question/{id}` for an answered question
- **THEN** the response carries the question's `id`, `title`, `content`,
  `createdAt`, `views`, `category` and `userId`, its author's `userName` and
  `userPicture`, and `answers` newest first
- **AND** each answer carries `id`, `content`, `createdAt`, `userId`,
  `userName`, `userPicture`, the author's `role`, and `commentCount`

#### Scenario: Unanswered question for the asker, a Guru or an Admin

- **WHEN** the asker, a Guru or an Admin requests an unanswered question
- **THEN** it is returned the same way, with no answers

#### Scenario: Unanswered question for anyone else

- **WHEN** anyone else — signed out, or signed in as another user — requests an
  unanswered question
- **THEN** the response is 404, the same as for a question that does not exist
- **AND** the question page shows "Pertanyaan tidak ditemukan" with a link back
  to Tanya Jawab

#### Scenario: Unknown question

- **WHEN** the id matches nothing
- **THEN** the response is 404

#### Scenario: Reading does not count a view

- **WHEN** `GET /api/question/{id}` is called
- **THEN** `views` is left unchanged

### Requirement: View counting

A question MUST count one view per real visit to its page, and MUST NOT count
views from listing or batch fetches, or from callers who may not see it.

#### Scenario: Recording a view

- **WHEN** `POST /api/question/{id}/view` is called for a question the caller
  may read
- **THEN** `Views` increases by one and `{ views }` is returned

#### Scenario: A question the caller may not read

- **WHEN** `POST /api/question/{id}/view` is called for an unanswered question by
  anyone other than its asker, a Guru or an Admin
- **THEN** the response is 404 and `Views` is unchanged

#### Scenario: Only the detail page counts

- **WHEN** a page other than the question detail page fetches a question
- **THEN** it does not call the view endpoint

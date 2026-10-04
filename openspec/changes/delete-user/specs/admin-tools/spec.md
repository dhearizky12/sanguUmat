## MODIFIED Requirements

### Requirement: Ringkasan

An Admin MUST see the site's numbers and what is waiting longest.

#### Scenario: Overview

- **WHEN** an Admin requests `GET /api/admin/overview`
- **THEN** the response is 200 with:
  - `users`: `{ total, anggota, ustadz, admin, newThisWeek }`, counting users who
    have not been deleted;
  - `questions`: `{ total, published, waiting, privateAnswered, anonymous }`;
  - `activity`: `{ answersThisWeek, commentsThisWeek, questionsThisWeek }`, over
    the last seven days;
  - `articles`: `{ published, drafts }`;
  - `kajian`: `{ scheduled, live, recorded }`;
  - `waiting`: the five oldest unanswered questions, oldest first, as
    `{ id, title, createdAt, directedTo }`.

#### Scenario: The Ringkasan page

- **WHEN** an Admin opens `/admin`
- **THEN** they see the numbers as labelled tiles (Pengguna, Pertanyaan,
  Aktivitas 7 hari, Artikel, Kajian), each linking to its tab
- **AND** "Perlu dijawab" lists the waiting questions with how long each has
  waited, linking to them
- **AND** "Panel Admin" in the header opens this page

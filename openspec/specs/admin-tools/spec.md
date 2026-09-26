# admin-tools Specification

## Purpose

The Admin's view of the whole site: how it is doing, what is waiting, and every
question, comment, article and kajian in one place to review and remove. It is
for moderation, not for editing other people's words.

## Requirements

### Requirement: Admin only

Every admin-tools endpoint and page MUST be for Admins only.

#### Scenario: Refused

- **WHEN** a signed-out caller uses any `/api/admin/overview`, `questions`,
  `comments`, `articles` or `kajian` endpoint
- **THEN** the response is 401
- **WHEN** a signed-in caller who is not an Admin uses one
- **THEN** the response is 403
- **AND** the pages send anyone who is not an Admin away, as Pengguna does today

### Requirement: Ringkasan

An Admin MUST see the site's numbers and what is waiting longest.

#### Scenario: Overview

- **WHEN** an Admin requests `GET /api/admin/overview`
- **THEN** the response is 200 with:
  - `users`: `{ total, anggota, ustadz, admin, newThisWeek }`;
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

### Requirement: Pertanyaan

An Admin MUST be able to find any question and remove it.

#### Scenario: Listing

- **WHEN** an Admin requests `GET /api/admin/questions`
- **THEN** the response is 200 with `{ items, total, page, totalPages }`: every
  question, newest first, 20 a page
- **AND** each item is `{ id, title, createdAt, category, asker: { id, name },
  isAnonymous, allowPublish, directedTo, answerCount, commentCount }`, with the
  asker never masked
- **WHEN** `?status=` is `menunggu`, `terjawab` or `privat`
- **THEN** only unanswered questions, answered published ones, or answered ones
  without consent are returned
- **WHEN** `?search=` is given
- **THEN** only questions whose title, body or asker name contains it match,
  ignoring case

#### Scenario: The Pertanyaan page

- **WHEN** an Admin opens `/admin/pertanyaan`
- **THEN** they get a search box, the Semua / Menunggu / Terjawab / Privat
  filter, and rows with the title, asker (with "anonim" when anonymous),
  category, date, "Ditujukan kepada {name}" when directed, "N jawaban · N
  komentar", and "Buka" and "Hapus"
- **AND** "Hapus" asks to confirm, deletes through `DELETE /api/question/{id}`,
  and removes the row, and the asker is notified as the notifications spec says

### Requirement: Komentar

An Admin MUST be able to review recent comments and remove them.

#### Scenario: Listing

- **WHEN** an Admin requests `GET /api/admin/comments`
- **THEN** the response is 200 with `{ items, total, page, totalPages }`: every
  comment, newest first, 20 a page, as `{ id, content, createdAt, user: { id,
  name }, answerId, question: { id, title } }`
- **WHEN** `?search=` is given
- **THEN** only comments whose content or author name contains it match

#### Scenario: The Komentar page

- **WHEN** an Admin opens `/admin/komentar`
- **THEN** they get a search box and rows with the comment, its author and date,
  "di: {question title}", and "Buka" (the question at that answer) and "Hapus"
- **AND** "Hapus" asks to confirm, deletes through the existing comment delete
  endpoint, and removes the row

### Requirement: Konten

An Admin MUST be able to see every article and kajian, whoever wrote or leads
it.

#### Scenario: Articles

- **WHEN** an Admin requests `GET /api/admin/articles`
- **THEN** the response is 200 with `{ items, total, page, totalPages }`: every
  article, drafts included, most recently updated first, 20 a page, as `{ id,
  title, status, author: { id, name }, category, updatedAt, publishedAt, views }`
- **AND** `?status=draft|published` and `?search=` (title or author name) narrow
  it

#### Scenario: Kajian

- **WHEN** an Admin requests `GET /api/admin/kajian`
- **THEN** the response is 200 with `{ items, total, page, totalPages }`: every
  kajian, latest start first, 20 a page, as `{ id, title, series, status,
  startsAt, durationMinutes, ustadz: { id, name }, views, hasNotes }`
- **AND** `?status=scheduled|live|recorded` and `?search=` (title, series or
  ustadz name) narrow it

#### Scenario: The Konten page

- **WHEN** an Admin opens `/admin/konten`
- **THEN** they can switch between "Artikel" and "Kajian", each with a search box,
  its status filter and pagination, and rows with the title, author or ustadz,
  status, date, and "Buka", "Ubah" and "Hapus"
- **AND** "Hapus" asks to confirm, deletes through the existing article or kajian
  delete endpoint, and removes the row

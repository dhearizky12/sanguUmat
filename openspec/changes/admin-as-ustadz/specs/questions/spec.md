## MODIFIED Requirements

### Requirement: Asking a question

A signed-in user MUST be able to ask a question with a title, a body, an
optional category, an optional ustadz it is directed to, whether to appear
anonymously, and whether its answer may be published.

#### Scenario: Creating a question

- **WHEN** a signed-in user posts `{ title, content, category?, directedTo?,
  isAnonymous?, allowPublish? }` to `POST /api/question`
- **THEN** the question is stored against them with `CreatedAt` set to now and
  `Views` at 0
- **AND** `isAnonymous` defaults to false and `allowPublish` to true when
  omitted

#### Scenario: Directing a question to an ustadz

- **WHEN** `directedTo` is the id of an ustadz (a Guru, or an Admin who is not hidden as an ustadz)
- **THEN** the question is stored as directed to that ustadz
- **WHEN** `directedTo` is the id of anyone who is not an ustadz, or of nobody
- **THEN** the response is 400 with "Ustadz yang dipilih tidak tersedia" and
  nothing is stored

#### Scenario: Unrecognised or omitted category

- **WHEN** the posted category is absent, or is not one of the known categories
- **THEN** the question is still created, with no category
- **AND** the UI labels it "Lainnya"

#### Scenario: Anonymous caller

- **WHEN** an unauthenticated caller posts to `POST /api/question`
- **THEN** the response is 401 and nothing is stored

#### Scenario: The Ajukan Pertanyaan form

- **WHEN** a signed-in user opens Ajukan Pertanyaan
- **THEN** below the category the form offers "Ditujukan kepada" (opsional),
  listing "Ustadz mana saja" and every ustadz
- **AND** below the body two check boxes: "Tampilkan sebagai anonim. Nama saya
  disembunyikan dari halaman publik." (off) and "Jawaban boleh ditayangkan di
  Tanya Jawab agar bermanfaat bagi jamaah lain." (on)
- **WHEN** the form is opened as `/question/create?ustadz={id}`
- **THEN** that ustadz is already chosen
- **AND** an ustadz's page offers "Tanya ustadz ini", which opens it that way

### Requirement: Browsing questions

Anyone, signed in or not, MUST be able to list the published questions newest
first, and narrow them by free text and category. Unpublished questions MUST be
listed only for a Guru or an Admin, and only while unanswered, for answering.

#### Scenario: Listing

- **WHEN** anyone requests `GET /api/question`
- **THEN** every published question is returned newest first, and no other
  question is
- **AND** each carries `id`, `title`, `content`, `createdAt`, `views`,
  `category`, `userId`, `userName`, `userPicture`, `isAnswered`,
  `commentCount`, `isAnonymous`, `allowPublish`, `directedTo` (`{ id, name }` or
  `null`), and `answeredBy` / `answeredByRole` / `answeredByPicture` — the name,
  role and picture of the answer shown for it (an ustadz's answer when there is
  one, otherwise the first), or `null` when unanswered
- **AND** the asker fields are masked as described under Anonymous askers

#### Scenario: Free-text search

- **WHEN** `?search=` is given
- **THEN** only questions whose title or body contains it are returned, matched
  case-insensitively

#### Scenario: Filtering by answered status

- **WHEN** `?status=answered` is given
- **THEN** the result is the same as with no status: published questions only
- **WHEN** a Guru or an Admin gives `?status=pending`
- **THEN** only questions with no answers are returned, whatever their consent,
  those directed to the caller first, then newest first
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
- **THEN** only published questions are listed, with no status filter and no
  answered/waiting tag on the rows
- **AND** each row shows its category at top left and, at top right, its date
  with its view and comment counts as icons; at the bottom, level across the
  row, who asked it on the left (avatar, "Ditanyakan" above the name, "Hamba
  Allah" for an anonymous asker) and who answered it on the right ("Dijawab"
  above the name, with the answerer's avatar carrying a small gold verified mark
  for an ustadz)

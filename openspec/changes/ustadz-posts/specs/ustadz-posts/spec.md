## Purpose

Lets an ustadz or Admin publish a question together with its answer in one step,
for questions received offline that are worth sharing with the community.

## ADDED Requirements

### Requirement: Publishing a post

A Guru or an Admin MUST be able to publish a question and its answer together,
credited to one ustadz. It is published immediately.

#### Scenario: A Guru posts

- **WHEN** a signed-in Guru sends `{ title, content, answer, category? }` to
  `POST /api/question/post`
- **THEN** a question and its answer are stored, both credited to that Guru, with
  `CreatedAt` set to now and `Views` at 0
- **AND** the response is 201 with the question's `id`
- **AND** it is published at once, with no asker, not anonymous and not directed

#### Scenario: An Admin posts for an ustadz

- **WHEN** a signed-in Admin sends `{ title, content, answer, category?, ustadzId }`
- **THEN** the question and answer are credited to that ustadz, and nothing shows
  the Admin

#### Scenario: Admin must name an ustadz

- **WHEN** an Admin omits `ustadzId`, or it is not a Guru
- **THEN** the response is 400 with "Pilih ustadz yang bersangkutan" and nothing
  is stored

#### Scenario: A Guru cannot post for someone else

- **WHEN** a Guru sends an `ustadzId` that is not their own
- **THEN** the response is 403 and nothing is stored

#### Scenario: Missing text

- **WHEN** the title, content or answer is empty or only whitespace
- **THEN** the response is 400 with "Judul, pertanyaan, dan jawaban harus diisi"
  and nothing is stored

#### Scenario: Others cannot post

- **WHEN** a signed-in User posts, or an unauthenticated caller does
- **THEN** the response is 403 for the User and 401 for the caller, and nothing is
  stored

#### Scenario: Unrecognised or omitted category

- **WHEN** the category is absent or unknown
- **THEN** the post is still created, with no category, labelled "Lainnya"

### Requirement: The posting page

Guru and Admin MUST have a dedicated page for writing a post, in Bahasa Indonesia.

#### Scenario: Opening the page

- **WHEN** a Guru or Admin opens `/posting/baru`
- **THEN** it offers "Pertanyaan" (title and body), "Jawaban" in the formatted
  editor described under `answers`, "Kategori", and for an Admin a required
  "Diposting atas nama" choice listing every ustadz
- **AND** a post's answer is always stored as a formatted answer
- **AND** a "Terbitkan" button that publishes the post and opens it

#### Scenario: Reaching the page

- **WHEN** a Guru or Admin looks at the header
- **THEN** it has "Tulis Posting", linking to the page
- **AND** their Profil has a "Tulis posting" button beside "Tulis artikel"
- **AND** an ustadz's page offers "Tulis posting" to that ustadz and to Admins,
  opening the page with that ustadz already chosen (`/posting/baru?ustadz={id}`)

#### Scenario: Not allowed

- **WHEN** a User or a signed-out visitor opens the page
- **THEN** they are sent away, as for the other staff-only pages

### Requirement: Credit and listing

A post MUST be listed like any other published question and credited with one
label.

#### Scenario: Listed with the others

- **WHEN** anyone browses, searches or filters Tanya Jawab, or opens an ustadz's
  page
- **THEN** posts appear among the answered questions, counted in the category
  and ustadz facets under the credited ustadz

#### Scenario: One credit on cards

- **WHEN** a post is shown on a card
- **THEN** it reads "Diposting oleh {nama}" and shows neither "Ditanyakan" nor
  "Dijawab"

#### Scenario: One credit on the question page

- **WHEN** a post's page is shown
- **THEN** it reads "Diposting oleh {nama}", linking to the ustadz, once, above the
  question
- **AND** its answer does not repeat the credit with "Dijawab oleh"

#### Scenario: Not in the queue

- **WHEN** a Guru opens Jawab Pertanyaan
- **THEN** posts are not listed, because they already have an answer

### Requirement: One answer per post

A post MUST carry only the answer it was published with.

#### Scenario: Answering a post

- **WHEN** a Guru sends `POST /api/answer/{questionId}` for a post
- **THEN** the response is 409 with "Posting ini sudah berisi jawaban" and nothing
  is stored

### Requirement: Editing a post

The credited ustadz and any Admin MUST be able to edit a post's texts together.

#### Scenario: Editing

- **WHEN** the credited Guru or an Admin sends `{ title, content, answer, category? }`
  to `PUT /api/question/post/{id}`
- **THEN** the question and its answer are updated and the credit is unchanged
- **AND** the same validation as publishing applies

#### Scenario: Admin changes the credit

- **WHEN** an Admin includes an `ustadzId` that is a Guru
- **THEN** the post, including its answer, is credited to that ustadz

#### Scenario: Someone else

- **WHEN** any other user attempts it
- **THEN** the response is 403 and nothing changes

#### Scenario: Not a post

- **WHEN** the id belongs to an ordinary question
- **THEN** the response is 404

#### Scenario: The edit page

- **WHEN** the credited Guru or an Admin opens `/posting/{id}/ubah`
- **THEN** the form from the posting page is shown with the current texts
- **AND** a post's page offers them "Ubah" and "Hapus"

### Requirement: Posts send no notifications

A post MUST NOT notify anyone, since nobody asked and nobody is waiting.

#### Scenario: Publishing, editing and deleting

- **WHEN** a post is published, edited, or deleted, or its answer is edited,
  including by an Admin
- **THEN** no notification is created for any ustadz or member

#### Scenario: Comments

- **WHEN** someone comments on a post's answer
- **THEN** the usual comment notifications apply, except that the credited ustadz
  is notified once, as the answer's writer

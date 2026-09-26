# ustadz-profiles Specification

## Purpose

Who the ustadz are: each Guru's public profile — credentials, bio, areas of
expertise and education — the Dewan Ustadz list, and a page per ustadz with the
questions they have answered, so readers can see who stands behind an answer.

## Requirements

### Requirement: Ustadz profile

Every user with the Guru role MUST have an ustadz profile made of a title line,
a bio, areas of expertise chosen from the categories, and an education history.

#### Scenario: A new Guru

- **WHEN** a user becomes a Guru
- **THEN** they appear as an ustadz with an empty title, bio, expertise and
  education until the profile is filled in

#### Scenario: A Guru who stops being one

- **WHEN** a Guru's role is changed to something else
- **THEN** they no longer appear in the Dewan Ustadz list and their page answers
  404, but the profile is kept for if they become a Guru again

#### Scenario: A deleted category

- **WHEN** a category an ustadz lists as expertise is deleted
- **THEN** it simply disappears from their expertise

### Requirement: Reading ustadz

Anyone MUST be able to list the ustadz and read any one of them.

#### Scenario: Listing

- **WHEN** anyone requests `GET /api/ustadz`
- **THEN** the response is 200 with every Guru as
  `{ id, name, picture, title, expertise: [{ key, name }], answerCount }`,
  most answers first, then by name
- **AND** `answerCount` counts their answers on published questions

#### Scenario: One ustadz

- **WHEN** anyone requests `GET /api/ustadz/{id}` for a Guru
- **THEN** the response is 200 with `{ id, name, picture, title, bio, expertise,
  education, answerCount, joinedAt }`, education as
  `[{ institution, degree, startYear, endYear }]` in the order it was entered
- **WHEN** the id is not a Guru
- **THEN** the response is 404

### Requirement: Editing a profile

An ustadz MUST be able to edit their own profile, and an Admin any ustadz's.
Nobody else may.

#### Scenario: Saving

- **WHEN** the ustadz or an Admin puts `{ title, bio, expertise, education }` to
  `PUT /api/ustadz/{id}`
- **THEN** the profile is replaced by it and the response is 200 with the profile
- **AND** unknown expertise keys are ignored

#### Scenario: Invalid input

- **WHEN** the title is longer than 120 characters
- **THEN** the response is 400 with "Gelar maksimal 120 karakter"
- **WHEN** the bio is longer than 1.000 characters
- **THEN** the response is 400 with "Profil singkat maksimal 1.000 karakter"
- **WHEN** there are more than 10 education entries, an entry has no
  institution, or a year is outside 1900 to ten years from now or the start is
  after the end
- **THEN** the response is 400 with "Riwayat pendidikan tidak valid"

#### Scenario: Not allowed

- **WHEN** a signed-out caller saves
- **THEN** the response is 401
- **WHEN** a signed-in caller who is neither that ustadz nor an Admin saves
- **THEN** the response is 403 and nothing changes
- **WHEN** the id is not a Guru
- **THEN** the response is 404

### Requirement: Ustadz pages

The app MUST offer a Dewan Ustadz page, a page per ustadz, and an edit page, in
the design system and in Bahasa Indonesia.

#### Scenario: Dewan Ustadz

- **WHEN** anyone opens `/ustadz`
- **THEN** every ustadz is shown with their avatar and gold tick, name, title,
  expertise and "N jawaban", each linking to their page
- **AND** the footer's "Dewan Ustadz" link leads here

#### Scenario: An ustadz's page

- **WHEN** anyone opens `/ustadz/{id}`
- **THEN** the page shows the profile — avatar with the gold tick, name, title,
  bio, expertise and education — and "Jawaban dari {name}": their answered
  questions, eight a page, with pagination
- **AND** a missing part of the profile is simply left out
- **WHEN** the id is not a Guru
- **THEN** the page shows "Ustadz tidak ditemukan." with a link to Dewan Ustadz

#### Scenario: Editing from the app

- **WHEN** the ustadz or an Admin views the ustadz's page
- **THEN** it offers "Ubah profil ustadz", which opens `/ustadz/{id}/ubah`
- **AND** a Guru's own Profil page and each Guru row in Panel Admin link there
  too
- **WHEN** anyone else opens `/ustadz/{id}/ubah`
- **THEN** they are sent to the ustadz's page

#### Scenario: Links to an ustadz

- **WHEN** an answer by a Guru is shown on the question page
- **THEN** the ustadz's name and avatar link to their page
- **AND** question cards, which are one link each, do not nest another link

#### Scenario: The old placeholder

- **WHEN** anyone opens `/detail-admin/{id}`
- **THEN** they are redirected to `/ustadz/{id}`

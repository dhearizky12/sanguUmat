## MODIFIED Requirements

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
- **WHEN** the whole profile is empty
- **THEN** visitors see the answers across the full width, with no profile
  column; the ustadz and Admins instead see "Profil belum diisi." with
  "Lengkapi profil"
- **WHEN** the id is not a Guru
- **THEN** the page shows "Ustadz tidak ditemukan." with a link to Dewan Ustadz

#### Scenario: The ustadz's work in tabs

- **WHEN** the ustadz has published articles or leads kajian
- **THEN** the main column offers tabs "Jawaban (N)", "Artikel (N)" and "Kajian
  (N)", each shown only when it has something, with Jawaban first
- **AND** Artikel lists their published articles as on Artikel, newest first,
  eight a page, with pagination
- **AND** Kajian lists their live and this week's kajian first, then their
  recordings, newest first, eight a page, with pagination
- **AND** the chosen tab and its page are kept in the URL (`?tab=artikel`,
  `?tab=kajian`, `?page=N`), and switching tab returns to page 1
- **WHEN** they have only answers
- **THEN** there are no tabs and the page shows "Jawaban dari {name}" as before

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

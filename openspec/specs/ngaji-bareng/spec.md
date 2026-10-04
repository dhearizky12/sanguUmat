# ngaji-bareng Specification

## Purpose

Ngaji Bareng: the kajian the ustadz hold on YouTube, organised on the site. It
covers what is live now, this week's schedule, and a searchable archive of
recordings with their catatan ngaji, each played in an embedded player. Nothing
is hosted or streamed by the site itself.

## Requirements

### Requirement: Kajian

A kajian MUST have a title, an optional description, a series, a leading ustadz,
a YouTube video, a start time and a duration, and MAY have catatan ngaji.

#### Scenario: Status from the clock

- **WHEN** the current time is before a kajian's start
- **THEN** its `status` is `scheduled`
- **WHEN** it is at or after the start and before start + duration
- **THEN** its `status` is `live`
- **WHEN** it is at or after start + duration
- **THEN** its `status` is `recorded`

#### Scenario: Session number

- **WHEN** a kajian is returned
- **THEN** `sessionNumber` is its position, counting from 1, among the kajian of
  the same series (ignoring case) ordered by start time

#### Scenario: YouTube link

- **WHEN** a kajian is saved with a YouTube link of the form
  `youtube.com/watch?v=ID`, `youtu.be/ID`, `youtube.com/live/ID`,
  `youtube.com/embed/ID` or `youtube.com/shorts/ID`, with or without `www.`,
  `m.` or extra parameters, or with the bare 11-character video id
- **THEN** the video id is stored, and `thumbnail` is
  `https://i.ytimg.com/vi/{id}/hqdefault.jpg`
- **WHEN** it is anything else
- **THEN** the response is 400 with "Tautan YouTube tidak dikenali"

#### Scenario: Catatan ngaji

- **WHEN** a kajian is saved with notes
- **THEN** they are sanitised with the same allowlist as article bodies, and
  `hasNotes` is true when any text remains

### Requirement: Managing kajian

A Guru MUST be able to add, edit and delete the kajian they lead. An Admin MUST
be able to manage any kajian and choose which Guru leads it. Nobody else may.

#### Scenario: Adding

- **WHEN** a Guru posts `{ title, description, series, youtube, startsAt,
  durationMinutes, notes }` to `POST /api/kajian`
- **THEN** the kajian is created with them leading it, and the response is 201
  with it
- **WHEN** an Admin posts the same with `ustadz`, a Guru's id
- **THEN** that Guru leads it
- **WHEN** an Admin omits `ustadz`, or gives an id that is not a Guru
- **THEN** the response is 400 with "Ustadz yang dipilih tidak tersedia"

#### Scenario: Validation

- **WHEN** the title is empty
- **THEN** the response is 400 with "Judul kajian harus diisi"
- **WHEN** the title is longer than 160 characters
- **THEN** the response is 400 with "Judul maksimal 160 karakter"
- **WHEN** the series is empty or longer than 60 characters
- **THEN** the response is 400 with "Seri harus diisi, maksimal 60 karakter"
- **WHEN** the description is longer than 1.000 characters
- **THEN** the response is 400 with "Deskripsi maksimal 1.000 karakter"
- **WHEN** the start time is missing
- **THEN** the response is 400 with "Waktu mulai harus diisi"
- **WHEN** the duration is below 5 or above 600 minutes
- **THEN** the response is 400 with "Durasi antara 5 dan 600 menit"
- **WHEN** the notes are longer than 100.000 characters
- **THEN** the response is 400 with "Catatan terlalu panjang"

#### Scenario: Editing and deleting

- **WHEN** the leading Guru or an Admin puts the same shape to
  `PUT /api/kajian/{id}`
- **THEN** the kajian is replaced by it and the response is 200 with it
- **AND** a Guru's edit keeps them leading it
- **WHEN** they send `DELETE /api/kajian/{id}`
- **THEN** it is removed and the response is 204

#### Scenario: Not allowed

- **WHEN** a signed-out caller adds, edits or deletes
- **THEN** the response is 401
- **WHEN** a signed-in caller who is neither a Guru nor an Admin adds
- **THEN** the response is 403
- **WHEN** a Guru edits or deletes a kajian led by someone else, or a former
  Guru edits or deletes one they led
- **THEN** the response is 403 and nothing changes
- **WHEN** the id does not exist
- **THEN** the response is 404

#### Scenario: My kajian

- **WHEN** a Guru requests `GET /api/kajian/mine`
- **THEN** the response is 200 with every kajian they lead, newest start first
- **WHEN** an Admin requests it
- **THEN** it holds every kajian

### Requirement: Now and this week

Anyone MUST be able to see what is live and what is coming up this week.

#### Scenario: Now

- **WHEN** anyone requests `GET /api/kajian/now`
- **THEN** the response is 200 with `live`, the live kajian (the one that
  started most recently if several are live) or null
- **AND** `previousWithNotes`, the latest earlier kajian of the live one's series
  that has notes, or null
- **AND** `schedule`, every kajian starting from now to seven days from now,
  soonest first

### Requirement: Recording archive

Anyone MUST be able to page through recorded kajian with search, facets and sort,
the same way as question and article browsing. Kajian that are scheduled or
live MUST NOT appear in it.

#### Scenario: Default page

- **WHEN** anyone requests `GET /api/kajian`
- **THEN** the response is 200 with `{ items, total, totalRecorded, page,
  pageSize, totalPages, facets }`, `items` holding the first 8 recorded kajian,
  most recent start first

#### Scenario: Paging

- **WHEN** `?page=` is given
- **THEN** that page is returned, and a page past the last returns the last one
- **WHEN** `?pageSize=` is given
- **THEN** it is used, capped at 50; a value below 1 falls back to 8

#### Scenario: Sorting

- **WHEN** `?sort=` is `terbaru`, `terlama`, `populer`, `singkat` or `abjad`
- **THEN** items are ordered newest first, oldest first, most viewed first,
  shortest first, or by title A–Z, with newest first breaking ties
- **WHEN** `sort` is missing or unknown
- **THEN** `terbaru` applies

#### Scenario: Search and filters

- **WHEN** `?search=` is given
- **THEN** only kajian whose title, description, series or notes contain it,
  case-insensitively, match
- **WHEN** one or more `?series=` or `?ustadz=` values are given
- **THEN** kajian in any of those series and led by any of those ustadz match,
  and the two facets together narrow
- **WHEN** `?notes=1` is given
- **THEN** only kajian with notes match

#### Scenario: Facet counts

- **WHEN** the response is built
- **THEN** `facets.series` lists every series of a recorded kajian with how many
  match, counted over every filter but the series filter
- **AND** `facets.ustadz` lists every ustadz leading a recorded kajian, counted
  over every filter but the ustadz filter
- **AND** `facets.notes` counts matching kajian with notes, over every filter
  but the notes filter

### Requirement: Watching a kajian

Anyone MUST be able to open a kajian and watch it on the site.

#### Scenario: One kajian

- **WHEN** anyone requests `GET /api/kajian/{id}`
- **THEN** the response is 200 with the kajian, its `notes` and
  `seriesSessions`: the other kajian of its series, by start time, each with
  its id, title, `startsAt`, `status` and `sessionNumber`
- **WHEN** the id does not exist
- **THEN** the response is 404

#### Scenario: Counting a view

- **WHEN** anyone posts to `POST /api/kajian/{id}/view`
- **THEN** its view count goes up by one and the response is 200 with `{ views }`

### Requirement: Ngaji Bareng page

Ngaji Bareng MUST follow its canvas, in the design system and Bahasa Indonesia,
leaving out membership, outside notifications and viewer counts, none of which
are planned.

#### Scenario: Live section

- **WHEN** a kajian is live
- **THEN** the page opens with it on the canvas's dark band: its thumbnail
  marked "Live", "Sedang berlangsung", the title, description, "Seri {series}",
  "Berjalan N menit" and "Sesi ke-N", and "Gabung kajian", which opens its page
- **AND** "Catatan sesi lalu" when an earlier session of the series has notes
- **WHEN** nothing is live
- **THEN** the band is not shown

#### Scenario: This week's schedule

- **WHEN** kajian are scheduled in the next seven days
- **THEN** "Jadwal pekan ini" · "Waktu Indonesia Barat" lists each with its day,
  date and time in WIB, series, duration, title and ustadz, and "Tambah ke
  kalender", which opens a Google Calendar event for it in a new tab
- **WHEN** there are none
- **THEN** it says "Belum ada jadwal kajian pekan ini."

#### Scenario: Archive

- **WHEN** the page is shown
- **THEN** "Arsip rekaman" offers a search box, "Seri" and "Ustadz" facet panels
  and a "Kelengkapan" · "Ada catatan ngaji" check box beside the results
  (above them at 900px or narrower)
- **AND** "N dari M rekaman", "Urutkan" with Terbaru, Terlama, Paling banyak
  disimak, Durasi tersingkat and Judul A–Z, and a one/two-column toggle on wide
  screens
- **AND** "Saringan aktif" chips with "Hapus semua", numbered pagination, and
  the state in the URL
- **AND** each recording shows its thumbnail with its duration on it, series,
  date, a "Catatan ngaji" tag when it has notes, title, ustadz and "N disimak",
  and links to its page
- **WHEN** nothing matches
- **THEN** it shows "Belum ada rekaman yang cocok." with "Atur ulang saringan"

#### Scenario: Managers

- **WHEN** a Guru or an Admin views the page
- **THEN** it offers "Tambah kajian" and "Kelola kajian"

### Requirement: Kajian page

Each kajian MUST have a page with its video.

#### Scenario: Watching

- **WHEN** anyone opens `/live/{id}`
- **THEN** they see the breadcrumb Ngaji Bareng › series, and the YouTube
  player embedded from youtube-nocookie.com at 16:9
- **AND** a status tag ("Live", "Jadwal" or "Rekaman"), the title, the ustadz
  with their avatar and gold tick linking to their page, "Seri {series} · Sesi
  ke-N", the date and time in WIB, the duration and "N disimak"
- **AND** the description, "Buka di YouTube", the catatan ngaji when any, and
  "Sesi lain dalam seri ini"
- **AND** one view is counted
- **WHEN** it is scheduled
- **THEN** it also offers "Tambah ke kalender"
- **WHEN** the leading Guru or an Admin views it
- **THEN** it offers "Ubah kajian" and "Hapus", which asks to confirm first
- **WHEN** the id does not exist
- **THEN** it shows "Kajian tidak ditemukan." with a link back to Ngaji Bareng

### Requirement: Managing pages

A Guru and an Admin MUST have pages to add, edit and find their kajian.

#### Scenario: Add and edit

- **WHEN** a Guru or an Admin opens `/live/tambah`, or the leading Guru or an
  Admin opens `/live/{id}/ubah`
- **THEN** they get fields for the title (with a count), series (suggesting the
  existing ones), the YouTube link (showing the video's thumbnail once it is
  recognised), date and time in WIB, duration in minutes, description (with a
  count), the ustadz (for an Admin only), and the catatan ngaji in the rich text
  editor
- **AND** "Simpan", which opens the kajian's page, showing the server's error
  message if saving fails
- **WHEN** anyone else opens them
- **THEN** a signed-out visitor is sent to sign in, and anyone else to `/live`
  (or the kajian's page, for an edit)

#### Scenario: Kelola kajian

- **WHEN** a Guru or an Admin opens `/live/kelola`
- **THEN** they see their kajian (all of them for an Admin) under "Live",
  "Terjadwal" and "Rekaman", each with its date and time in WIB, series and
  ustadz, and links to open and edit it, plus "Tambah kajian"
- **WHEN** there are none
- **THEN** it says "Belum ada kajian." and offers "Tambah kajian"

## MODIFIED Requirements

### Requirement: Managing kajian

A Guru MUST be able to add, edit and delete the kajian they lead. An Admin MUST
be able to manage any kajian and choose which ustadz leads it. Nobody else may.

#### Scenario: Adding

- **WHEN** a Guru posts `{ title, description, series, youtube, startsAt,
  durationMinutes, notes }` to `POST /api/kajian`
- **THEN** the kajian is created with them leading it, and the response is 201
  with it
- **WHEN** an Admin posts the same with `ustadz`, an ustadz's id (a Guru, or an
  Admin not hidden as an ustadz)
- **THEN** that ustadz leads it
- **WHEN** an Admin omits `ustadz`, or gives an id that is not an ustadz
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

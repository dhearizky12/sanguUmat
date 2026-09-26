## MODIFIED Requirements

### Requirement: Admin-only access

Every endpoint under `/api/admin` MUST be reachable only by an `Admin`.

#### Scenario: Non-admin is refused

- **WHEN** a signed-in `User` or `Guru` calls any `/api/admin` endpoint
- **THEN** the response is 403

#### Scenario: Anonymous caller is refused

- **WHEN** an unauthenticated caller calls any `/api/admin` endpoint
- **THEN** the response is 401

#### Scenario: Admin panel is hidden

- **WHEN** a signed-in user is not an `Admin`
- **THEN** the admin entry point is absent from the UI

#### Scenario: The panel's tabs

- **WHEN** an Admin opens "Panel Admin" from the header
- **THEN** it opens on Ringkasan (`/admin`)
- **AND** every Panel Admin page offers the tabs Ringkasan, Pertanyaan, Komentar,
  Konten, Pengguna and Kategori

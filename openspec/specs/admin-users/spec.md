## Purpose

How an Admin promotes a trusted person to `Guru` so they can answer questions —
the platform's only route to a verified teacher — and reviews who holds which
role.

## Requirements

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

### Requirement: Browsing users

An Admin MUST be able to list every user, sorted by name, and narrow the list by
free text or role.

#### Scenario: Listing

- **WHEN** an Admin requests `GET /api/admin/users`
- **THEN** every user is returned sorted by name
- **AND** each carries `id`, `name`, `email`, `role`, `createdAt` and `lastLogin`

#### Scenario: Search

- **WHEN** `?search=` is given
- **THEN** only users whose name or email contains it are returned, matched
  case-insensitively

#### Scenario: Filtering by role

- **WHEN** `?role=` is given
- **THEN** only users holding that role are returned

### Requirement: Changing a role

An Admin MUST be able to move any user between `User`, `Guru` and `Admin`.

#### Scenario: Promoting to Guru

- **WHEN** an Admin sends `{ role: "Guru" }` to
  `PATCH /api/admin/users/{id}/role`
- **THEN** that user's role becomes `Guru` and they can answer questions
- **AND** the response carries the updated `id`, `name`, `email` and `role`

#### Scenario: Unknown role

- **WHEN** the posted role is not one of `User`, `Guru` or `Admin`
- **THEN** the response is 400 and nothing changes

#### Scenario: Unknown user

- **WHEN** the target user id matches nothing
- **THEN** the response is 404

### Requirement: Admins cannot lock themselves out

An Admin MUST NOT be able to demote their own account, which could leave the
platform with no administrator.

#### Scenario: Self-demotion refused

- **WHEN** an Admin sends a role other than `Admin` for their own id
- **THEN** the response is 400 and their role is unchanged

#### Scenario: Demoting another admin

- **WHEN** an Admin demotes a different Admin
- **THEN** the change is allowed

### Requirement: Hiding an Admin from the ustadz lists

Every Admin is an ustadz by default. An Admin MUST be able to hide any Admin
(including themselves) from the ustadz lists, for an Admin who administers but does
not teach. A hidden Admin is simply not presented as an ustadz.

#### Scenario: Hiding

- **WHEN** an Admin sends `{ hidden: true }` to `PATCH /api/admin/users/{id}/ustadz`
  for a user whose role is `Admin`
- **THEN** that Admin is hidden and the response carries the updated `id`, `name`,
  `email`, `role` and `hiddenAsUstadz`
- **WHEN** `{ hidden: false }` is sent
- **THEN** they are listed as an ustadz again

#### Scenario: Not an Admin

- **WHEN** the target user's role is not `Admin`
- **THEN** the response is 400 and nothing changes
- **WHEN** the target user id matches nothing
- **THEN** the response is 404

#### Scenario: What hidden means

- **WHEN** an Admin is hidden
- **THEN** they are left out of Dewan Ustadz and of every ustadz choice (a question's
  "Ditujukan kepada", "Diposting atas nama", a kajian's ustadz) and of the ustadz
  facet and count, have no ustadz page, show no gold tick, and receive no ustadz
  notifications
- **AND** they can still answer questions, answer queue and all, as any Admin can
- **AND** answers, posts and articles they wrote earlier stay, shown without a link
  to an ustadz page

#### Scenario: In Panel Admin

- **WHEN** an Admin opens Pengguna
- **THEN** each Admin's row shows "Tampil di daftar ustadz" or "Disembunyikan dari
  daftar ustadz" with a button "Sembunyikan" or "Tampilkan" that changes it
- **AND** each user is listed with `hiddenAsUstadz`

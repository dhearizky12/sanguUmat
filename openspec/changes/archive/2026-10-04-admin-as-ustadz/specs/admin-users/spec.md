## ADDED Requirements

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

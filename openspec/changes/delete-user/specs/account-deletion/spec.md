## Purpose

Deleting a user account: removing the person's data while what they wrote stays,
credited to "Hamba Allah". The account is anonymized, not erased, so nothing it
wrote loses its place.

## ADDED Requirements

### Requirement: Deleting an account

An Admin MUST be able to delete any other user, and any user who is not an Admin
MUST be able to delete their own account. Deleting is permanent.

#### Scenario: An Admin deletes a user

- **WHEN** an Admin sends `DELETE /api/admin/users/{id}` for another user, of any
  role
- **THEN** the account is deleted as described under "What deleting does" and the
  response is 204

#### Scenario: Not the Admin's own account

- **WHEN** an Admin sends `DELETE /api/admin/users/{id}` with their own id
- **THEN** the response is 400 and nothing changes, so an Admin cannot lock
  themselves out

#### Scenario: Unknown or already deleted

- **WHEN** the id matches no user, or a user who is already deleted
- **THEN** the response is 404

#### Scenario: Not an Admin

- **WHEN** a signed-in User or Guru calls `DELETE /api/admin/users/{id}`
- **THEN** the response is 403
- **WHEN** an unauthenticated caller does
- **THEN** the response is 401

#### Scenario: Deleting your own account

- **WHEN** a signed-in User or Guru sends `DELETE /api/auth/account`
- **THEN** their account is deleted as described under "What deleting does" and the
  response is 204
- **WHEN** a signed-in Admin sends it
- **THEN** the response is 400 with "Admin tidak dapat menghapus akunnya sendiri.
  Minta Admin lain menurunkan perannya lebih dulu." and nothing changes
- **WHEN** an unauthenticated caller sends it
- **THEN** the response is 401

#### Scenario: The delete controls

- **WHEN** an Admin opens Pengguna
- **THEN** every row except their own has "Hapus pengguna"
- **AND** choosing it asks "Hapus pengguna ini? Data pribadinya dihapus dan
  tulisannya tetap tampil sebagai Hamba Allah. Tindakan ini tidak bisa dibatalkan."
  and removes the row when confirmed
- **WHEN** a User or Guru opens their Profil
- **THEN** it has "Hapus akun", which asks "Hapus akun ini? Data pribadimu dihapus
  dan tulisanmu tetap tampil sebagai Hamba Allah. Tindakan ini tidak bisa
  dibatalkan." and, when confirmed, signs them out and shows Masuk
- **AND** an Admin's Profil does not show "Hapus akun"

### Requirement: What deleting does

Deleting an account MUST remove the person's data and MUST keep what they wrote,
shown as "Hamba Allah".

#### Scenario: Personal data is removed

- **WHEN** an account is deleted
- **THEN** its name becomes "Hamba Allah", and its email, photo, phone and address
  are removed, along with the uploaded photo file
- **AND** its role becomes `User`, it is no longer hidden or shown as an ustadz, and
  its ustadz profile, expertise and education are removed
- **AND** every notification it received is removed

#### Scenario: What they wrote stays

- **WHEN** an account is deleted
- **THEN** their answers, comments, articles, ustadz posts and the kajian they led
  stay, and so do the questions they asked that have an answer and may be published
- **AND** each shows "Hamba Allah", with no photo, no link to a page and no gold
  tick, and a post reads "Diposting oleh Hamba Allah"

#### Scenario: Questions nobody else can use are removed

- **WHEN** an account is deleted
- **THEN** every question it asked that has no answer, or that does not allow
  publishing, is deleted, with any answers and comments under it

#### Scenario: Questions directed to them

- **WHEN** an account that questions were directed to is deleted
- **THEN** those questions are no longer directed to anyone

#### Scenario: Their name in other people's notifications

- **WHEN** an account is deleted
- **THEN** other people's notifications that name it show "Hamba Allah" instead

#### Scenario: Left out of lists

- **WHEN** an account is deleted
- **THEN** it is no longer listed in Pengguna, in Dewan Ustadz, in any ustadz choice,
  or in the counts in Panel Admin

### Requirement: Signing in after deletion

A deleted account MUST NOT be revived by a token issued before the deletion, and a
person MUST be able to sign up again as a new user.

#### Scenario: An old token

- **WHEN** a token issued before the account was deleted is used
- **THEN** the caller is signed out and no account is created, until the token
  expires

#### Scenario: Signing up again

- **WHEN** someone signs in with Google using the Google account of a deleted user
- **THEN** a brand-new account is created for them, with none of the old content, and
  the old, deleted account stays anonymous

### Requirement: Privacy page

The Kebijakan Privasi page MUST say how a person deletes their data.

#### Scenario: Menghapus data

- **WHEN** anyone reads Kebijakan Privasi
- **THEN** "Menghapus data" says the account can be deleted from Profil ("Hapus
  akun"), that personal data is then removed, and that questions with answers,
  answers, comments and articles stay, shown as "Hamba Allah"

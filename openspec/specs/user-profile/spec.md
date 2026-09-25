## Purpose

The account details a signed-in person keeps beyond their Google identity —
display name, phone, address and avatar — plus the profile-completion gate the
app applies on first sign-in.

## Requirements

### Requirement: Viewing own profile

A signed-in user MUST be able to read their own profile.

#### Scenario: Reading the profile

- **WHEN** a signed-in user requests `GET /api/auth/profile`
- **THEN** the response contains `id`, `name`, `email`, `picture`, `phone`,
  `address`, `role`, `createdAt` and `lastLogin`

#### Scenario: No account

- **WHEN** the caller has no matching `User` row
- **THEN** the response is 404

### Requirement: Profile completion

A new account MUST complete its profile before using the rest of the app. Phone
and address are both mandatory; completing the profile sets
`HasCompletedProfile`.

#### Scenario: Completing the profile

- **WHEN** a signed-in user posts `{ name, phone, address }` to
  `POST /api/auth/complete-profile` with a non-empty phone and address
- **THEN** those fields are saved, `HasCompletedProfile` becomes `true`, and the
  response is 200

#### Scenario: Missing phone or address

- **WHEN** a signed-in user posts to `POST /api/auth/complete-profile` with an
  empty phone or address
- **THEN** the profile is not marked complete
- **AND** the response is a 400 carrying the message
  "Nomor telepon dan alamat harus diisi untuk menyelesaikan profil"

#### Scenario: Incomplete profile is redirected

- **WHEN** a signed-in user whose `hasCompletedProfile` is `false` opens the app
- **THEN** they are sent to the profile form before they can continue

### Requirement: Avatar

A signed-in user MUST be able to replace the Google avatar with their own
upload.

#### Scenario: Uploading a picture

- **WHEN** a signed-in user posts a file to `POST /api/auth/upload-picture`
- **THEN** the file is stored under `wwwroot/uploads` with a generated name
- **AND** the user's `Picture` becomes the server-relative path `/uploads/<name>`
- **AND** the response is `{ picture }`

#### Scenario: Empty upload

- **WHEN** the request carries no file, or a zero-length one
- **THEN** the response is a 400 carrying the message "Berkas kosong"

### Requirement: Avatar resolution

Avatars come from two sources — Google, as an absolute `https://` URL, and our
own uploads, as a server-relative `/uploads/...` path. The UI MUST render both
correctly, including when the app is mounted under a path prefix.

#### Scenario: Google avatar

- **WHEN** a user's picture is an absolute `https://` URL
- **THEN** it is used unchanged, with no prefix applied

#### Scenario: Uploaded avatar

- **WHEN** a user's picture is a server-relative path
- **THEN** the API origin and any mount prefix are applied exactly once

#### Scenario: Missing avatar

- **WHEN** a user has no picture
- **THEN** the UI falls back to the default avatar

## Purpose

Identity for Sangu Umat. Visitors sign in with Google; the platform keeps a
cookie session and a local `User` record carrying the role that every other
capability authorises against.

## Requirements

### Requirement: Google sign-in

The platform MUST authenticate people through Google OAuth and MUST NOT accept
any password of its own.

#### Scenario: Starting sign-in

- **WHEN** a visitor requests `GET /api/auth/login`
- **THEN** the platform issues a Google OAuth challenge
- **AND** on success returns the visitor to the configured frontend base URL

#### Scenario: Signing out

- **WHEN** a signed-in user requests `GET /api/auth/logout`
- **THEN** the session cookie is cleared
- **AND** the user is returned to `/login`

### Requirement: Session identity

The platform MUST expose the caller's identity and role, and MUST create the
local `User` record on first sign-in.

#### Scenario: First sign-in creates the account

- **WHEN** an authenticated caller requests `GET /api/auth/me` and no `User` row
  matches their Google id
- **THEN** a `User` is created from the Google claims (id, email, name, picture)
- **AND** `HasCompletedProfile` is `false`
- **AND** the response is `{ isAuthenticated: true, id, name, email, picture, role, hasCompletedProfile }`

#### Scenario: Returning user

- **WHEN** an authenticated caller requests `GET /api/auth/me` and their `User`
  row exists
- **THEN** `LastLogin` is updated to now
- **AND** the same response shape is returned

#### Scenario: Anonymous caller

- **WHEN** an unauthenticated caller requests `GET /api/auth/me`
- **THEN** the response is `{ isAuthenticated: false }` with status 200
- **AND** no `User` row is created

### Requirement: Roles

Every user MUST hold exactly one role: `User`, `Guru`, or `Admin`. New accounts
MUST default to `User`.

#### Scenario: Default role

- **WHEN** a new account is created on first sign-in
- **THEN** its role is `User`

### Requirement: Bootstrap administrator

The platform MUST allow a first `Admin` to exist without editing the database by
hand, via an `AdminEmails` configuration list.

#### Scenario: Configured email becomes Admin

- **WHEN** an account is created on first sign-in and its email matches an entry
  in `AdminEmails`, compared case-insensitively
- **THEN** the account's role is `Admin` instead of `User`

#### Scenario: Bootstrap applies only at creation

- **WHEN** a user whose email is in `AdminEmails` signs in and their account
  already exists
- **THEN** their existing role is left untouched

### Requirement: Credential handling

Google client credentials and the database connection string MUST come from
configuration or environment, never from source. The application MUST refuse to
start when they are absent.

#### Scenario: Missing credentials

- **WHEN** the application starts without `Authentication:Google:ClientId` or
  `Authentication:Google:ClientSecret`
- **THEN** startup fails with an `InvalidOperationException` naming the missing key

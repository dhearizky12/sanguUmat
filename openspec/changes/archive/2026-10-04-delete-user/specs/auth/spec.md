## MODIFIED Requirements

### Requirement: Session identity

The platform MUST identify the caller from a valid bearer token, expose the
caller's identity and role, and MUST create the local `User` record on first
sign-in. The `hasCompletedProfile` it reports MUST follow the profile-completion
rule in `user-profile`: a name plus an email or a phone.

#### Scenario: First sign-in creates the account

- **WHEN** a caller with a valid token requests `GET /api/auth/me` and no `User`
  row matches their Google id
- **THEN** a `User` is created from the Google claims (id, email, name, picture)
- **AND** `HasCompletedProfile` is `true` when the claims carry a non-empty name
  and email, and `false` otherwise
- **AND** the response is `{ isAuthenticated: true, id, name, email, picture, role, hasCompletedProfile }`

#### Scenario: Returning user

- **WHEN** a caller with a valid token requests `GET /api/auth/me` and their
  `User` row exists
- **THEN** `LastLogin` is updated to now
- **AND** `HasCompletedProfile` is re-evaluated against the completion rule and
  stored if it changed, so an account created under an earlier rule is
  corrected
- **AND** the same response shape is returned

#### Scenario: Anonymous caller

- **WHEN** a caller with no token, or an invalid or expired one, requests
  `GET /api/auth/me`
- **THEN** the response is `{ isAuthenticated: false }` with status 200
- **AND** no `User` row is created

#### Scenario: A deleted account

- **WHEN** a caller whose token names a Google id that belongs to a deleted account
  requests `GET /api/auth/me`
- **THEN** the response is `{ isAuthenticated: false }` with status 200
- **AND** no `User` row is created, and every other endpoint treats the caller as
  signed out

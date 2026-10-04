## Purpose

Identity for Sangu Umat. Visitors sign in with Google; the platform keeps a
bearer-token session and a local `User` record carrying the role that every other
capability authorises against.

## Requirements

### Requirement: Google sign-in

The platform MUST authenticate people through Google OAuth and MUST NOT accept
any password of its own. After signing in, a visitor MUST be brought back to the
page they started from, carrying a bearer token that proves who they are.

#### Scenario: Starting sign-in

- **WHEN** a visitor requests `GET /api/auth/login`
- **THEN** the platform issues a Google OAuth challenge
- **AND** on success returns the visitor to the frontend's sign-in completion
  page (`/masuk/selesai`), carrying the page to return to and the token in the
  URL fragment (`#token=…`), never in the query string

#### Scenario: Returning to the page the visitor came from

- **WHEN** a visitor requests `GET /api/auth/login?returnUrl=<path>` where
  `<path>` is a path within the app (starts with a single `/`)
- **THEN** after sign-in they end up on `<path>`

#### Scenario: Unsafe return address

- **WHEN** `returnUrl` is missing, absolute (`https://…`), protocol-relative
  (`//…`) or otherwise not a path within the app
- **THEN** it is ignored and the visitor returns to the home page

#### Scenario: Signing in did not complete

- **WHEN** the visitor reaches the token step without a completed Google sign-in
- **THEN** no token is issued and they are sent to the frontend's `/login` page

#### Scenario: Signing out

- **WHEN** a signed-in user chooses to sign out
- **THEN** the browser discards its token and shows `/login`
- **AND** the platform has no logout endpoint

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

Google client credentials, the token signing key and the database connection
string MUST come from configuration or environment, never from source. The
application MUST refuse to start when they are absent, and MUST refuse a signing
key too short to be safe.

#### Scenario: Missing credentials

- **WHEN** the application starts without `Authentication:Google:ClientId` or
  `Authentication:Google:ClientSecret`
- **THEN** startup fails with an `InvalidOperationException` naming the missing key

#### Scenario: Missing or weak signing key

- **WHEN** the application starts without `Jwt:Key`, or with one shorter than 32
  characters
- **THEN** startup fails with an `InvalidOperationException` naming the key

### Requirement: Bearer token session

Authenticated API calls MUST carry the token as `Authorization: Bearer <token>`.
A token MUST be signed by the platform, MUST identify the visitor by their Google
id, email, name and picture, and MUST expire 7 days after it is issued. There are
no refresh tokens: after expiry the visitor signs in again.

#### Scenario: Valid token

- **WHEN** a request carries an unexpired token signed by the platform
- **THEN** it is treated as that visitor, with the role stored on their `User` row

#### Scenario: Protected endpoint without a valid token

- **WHEN** a request to an endpoint that needs sign-in carries no token, an
  expired token, or one with a bad signature
- **THEN** the response is 401, not a redirect to Google

#### Scenario: Role changes

- **WHEN** an Admin changes someone's role
- **THEN** their next request is authorised under the new role without signing in
  again, because the role is read from the `User` row, not from the token

#### Scenario: Expired token in the browser

- **WHEN** the browser receives a 401 for a request it sent with a token
- **THEN** it discards the token and the visitor is treated as signed out

#### Scenario: Token kept out of addresses

- **WHEN** the frontend opens `/masuk/selesai#token=…`
- **THEN** it stores the token and removes it from the address bar and history
  entry before showing any page

### Requirement: UI on another origin

The API MUST accept requests from the origins listed in `Cors:AllowedOrigins`,
including the `Authorization` header, so the UI can be hosted on a different site.

#### Scenario: Listed origin

- **WHEN** a browser at a listed origin calls the API
- **THEN** the preflight and the call are allowed

#### Scenario: Unlisted origin

- **WHEN** a browser at any other origin calls the API
- **THEN** the browser is not granted access to the response

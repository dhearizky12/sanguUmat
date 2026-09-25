## REMOVED Requirements

### Requirement: Profile completion

**Reason**: Phone and address were mandatory and an incomplete profile was
redirected to the form, which blocked people over fields the app does not need.
**Migration**: Replaced by "Profile completeness" below — a name plus an email
or phone. Existing accounts are re-evaluated on their next `GET /api/auth/me`.

## ADDED Requirements

### Requirement: Profile completeness

A profile MUST count as complete when it has a non-empty name and at least one
contact — an email or a phone. Phone and address MUST be optional. The app MUST
NOT hold a signed-in user back from any page because their profile is
incomplete.

#### Scenario: Saving a profile

- **WHEN** a signed-in user posts `{ name, phone, address }` to
  `POST /api/auth/complete-profile` with a non-empty name
- **THEN** the name, phone and address are saved as given, empty phone and
  address included, and the response is 200
- **AND** `HasCompletedProfile` becomes `true` when the account then has an
  email or a phone, and `false` when it has neither

#### Scenario: Missing name

- **WHEN** a signed-in user posts to `POST /api/auth/complete-profile` with an
  empty name
- **THEN** nothing is saved
- **AND** the response is a 400 carrying the message "Nama harus diisi"

#### Scenario: Google account is complete from the start

- **WHEN** a person signs in with Google for the first time
- **THEN** their account is complete without filling in the profile form,
  because Google supplies both a name and an email

#### Scenario: Complete profile after sign-in

- **WHEN** a person finishes signing in and their profile is complete
- **THEN** they go straight back to the page they started from, without seeing
  the profile form

#### Scenario: Incomplete profile after sign-in

- **WHEN** a person finishes signing in and their profile is incomplete
- **THEN** they are shown the profile form once, titled "Lengkapi profil"
- **AND** saving it takes them on to the page they started from

#### Scenario: Incomplete profile is not redirected while browsing

- **WHEN** a signed-in user whose `hasCompletedProfile` is `false` opens the
  home page or any other page outside of signing in
- **THEN** that page is shown; they are not sent to the profile form

#### Scenario: Optional fields on the form

- **WHEN** a signed-in user opens the profile form
- **THEN** phone and address are labelled "opsional"
- **AND** leaving the name empty and saving shows "Nama harus diisi." without
  sending the form
- **AND** a side column explains what each field is for — the phone lets an
  ustadz reach them if an answer needs follow-up, the address is optional —
  and that neither is shown on any public page

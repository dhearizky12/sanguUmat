# site-header Specification

## Purpose
The site header's actions on wide screens: which buttons sit in the bar and which go
into the account menu, so the bar stays short whatever the visitor's role.

## Requirements

### Requirement: Header actions and the account menu

On wide screens the header MUST show at most one action button; when a signed-in
visitor has more actions than that, all of them MUST move into the account menu
opened from their avatar, so the bar never gets crowded.

#### Scenario: Which actions exist

- **WHEN** the header is built for a visitor
- **THEN** their actions are those that apply to them: "Ajukan Pertanyaan" for a
  member (and a signed-out visitor), "Jawab Pertanyaan" for a Guru or an Admin, and
  "Panel Admin" for an Admin

#### Scenario: One action

- **WHEN** a visitor has one action, or is signed out
- **THEN** it is a button in the header, as before

#### Scenario: More than one action

- **WHEN** a signed-in visitor has more than one action, such as an Admin with "Jawab
  Pertanyaan" and "Panel Admin"
- **THEN** none of them is a button in the header
- **AND** all of them are items in the account menu

#### Scenario: Adding actions later

- **WHEN** a new header action is added for some role
- **THEN** the same rule decides where it goes, with no role-specific handling

### Requirement: The account menu

Every signed-in visitor MUST have an account menu on their avatar, with their
profile and sign-out in it.

#### Scenario: Opening it

- **WHEN** a signed-in visitor chooses their avatar on a wide screen
- **THEN** a menu opens under it listing, in order: the overflowed actions (if any),
  "Profil saya" (their Profil page) and "Keluar"
- **AND** it closes on Escape, on a click outside it, and after an item is chosen
- **AND** the avatar is a button labelled "Menu akun" that reports whether the menu is
  open

#### Scenario: Keluar

- **WHEN** they choose "Keluar"
- **THEN** they are signed out and shown Masuk, as the button on Profil does

#### Scenario: Pending count

- **WHEN** "Jawab Pertanyaan" is in the menu and questions are waiting
- **THEN** the avatar carries the count as a badge and the item shows it too

#### Scenario: On a phone

- **WHEN** the header is shown below the desktop breakpoint
- **THEN** it is unchanged: the burger menu lists every destination and action as a
  row

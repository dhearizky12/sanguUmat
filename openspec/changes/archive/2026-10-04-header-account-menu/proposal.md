# Proposal

## Why

The header's right side holds a button per role action ("Jawab Pertanyaan", "Panel
Admin", and before this, "Tulis Posting") plus the bell and avatar, and it gets
crowded for Admins and ustadz. It should stay short without special-casing roles.

## What Changes

Frontend only (the backend already serves everything the menu needs).

- A rule, not a role check: the header collects the visitor's actions; with more than
  one, they all move into a dropdown on the avatar. One action stays a button.
- The avatar becomes a button that opens an account menu: the overflowed actions,
  "Profil saya" and "Keluar".
- "Jawab Pertanyaan" keeps its pending count: on the item and as a badge on the avatar.
- The phone layout is unchanged.

## Capabilities

### New Capabilities

- `site-header`: which actions sit in the header, the overflow rule, and the account menu.

### Modified Capabilities

- `answers`: where the pending count shows.
- `admin-tools`, `admin-users`: "Panel Admin" may be in the account menu.

## Impact

- Frontend: `Header.jsx` (collects actions, applies the rule), a new `AccountMenu.jsx`.
- No API or data changes.

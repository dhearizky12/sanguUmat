## Why

A new account today is marked incomplete until it supplies a phone number and an
address, and the Dashboard keeps redirecting it to the profile form until it
does. Neither field is needed for anything the app does, so the rule only
blocks people. What the platform actually needs is a way to address the person
(a name) and a way to reach them (an email or a phone) — which Google sign-in
already provides, and which a future WhatsApp sign-in (phone only) will provide
all but the name of.

## What Changes

Both backend and frontend.

- A profile is **complete** when it has a non-empty name and at least one
  contact: an email or a phone. Phone and address become optional.
- `HasCompletedProfile` is derived from that rule rather than set only by the
  profile form: at account creation, whenever the profile is saved, and when
  `GET /api/auth/me` reads an existing row (so accounts created under the old
  rule are corrected on their next visit).
- `POST /api/auth/complete-profile` (signed in; body `{ name, phone, address }`;
  200 with no body) accepts an empty phone and address. It rejects an empty name
  with **400** and the message "Nama harus diisi", instead of throwing — which
  also pays off the known deviation where a missing field produced a 500.
- **BREAKING (behaviour):** the Dashboard no longer redirects an incomplete
  profile to `/edit-profile`. Nothing enforces completion beyond the rule above.
- After signing in, a person returns to the page they started from.
  `GET /api/auth/login` (public; redirects) takes an optional `returnUrl`, kept
  only when it is a path within the app. An incomplete profile sees the
  profile form once on the way, then continues to that page.
- The profile form marks phone and address as optional, and gains a side
  column explaining what each is for and who can see them.

No new endpoint. `GET /api/auth/login` gains the optional `returnUrl` query
parameter; `GET /api/auth/me` and `GET /api/auth/profile` keep their response
shapes. New frontend route: `/masuk/selesai`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `user-profile`: the "Profile completion" requirement is replaced by "Profile completeness" — name plus one
  contact instead of phone plus address, no redirect, and a 400 for a missing
  name.
- `auth`: "Google sign-in" returns the visitor to the page they started from;
  "First sign-in creates the account" no longer always starts the
  account as incomplete; a Google account with a name and email is complete
  from creation.

## Impact

- Backend: `Controllers/AuthController.cs` (`Me`, `CompleteProfile`), plus a
  small helper for the completeness rule. No migration — the existing
  `HasCompletedProfile` column is kept and kept in step.
- Frontend: `pages/Dashboard.jsx` (redirect removed), `pages/EditProfile.jsx`
  (optional fields, name validation, side column).
- `openspec/ROADMAP.md`: the complete-profile deviation listed under "Deferred"
  is resolved by this change.
- Interacts with roadmap change 6, `whatsapp-otp-login`: a phone-only account
  will be incomplete until it has a name. How that sign-in asks for the name is
  left to that change.

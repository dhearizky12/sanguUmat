## Context

`HasCompletedProfile` is a stored column set only by
`POST /api/auth/complete-profile`, which throws (a 500) unless phone and address
are present. New Google accounts start with it `false`, and `Dashboard.jsx`
redirects to `/edit-profile` while it stays `false`. Phone and address are
returned only by `GET /api/auth/profile` to the user themselves; no other screen
or endpoint exposes them.

## Goals / Non-Goals

**Goals:**
- One completeness rule, evaluated in one place on the backend.
- Existing rows corrected without a migration or a manual script.

**Non-Goals:**
- How a phone-only (WhatsApp) sign-in collects the name — change 6 decides.
- Showing phone or address to an ustadz or admin. The side-column copy states
  the intended use; exposing the data is its own change.
- Removing the `HasCompletedProfile` column.

## Decisions

**Keep the column, derive its value.** A small helper computes
`!IsNullOrWhiteSpace(Name) && (!IsNullOrWhiteSpace(Email) || !IsNullOrWhiteSpace(Phone))`
and is applied at account creation, on every profile save, and on every
`GET /api/auth/me` (which already writes `LastLogin`, so the extra assignment
rides the same `SaveChanges`). Alternative considered: drop the column and
compute on read — rejected because it needs a migration and nothing is gained;
the column stays correct and queryable.

**Correct old rows lazily on `me`, not with a data migration.** Every signed-in
visit calls `me`, so each account is fixed on its next visit. A migration would
fix accounts that never return, which does not matter; lazily is simpler and
reversible.

**Validate name as a 400, not an exception.** `CompleteProfile` returns
`BadRequest("Nama harus diisi")` for an empty name. The frontend checks the same
thing first and shows "Nama harus diisi." so the 400 is a backstop.

**Remove the redirect outright.** No banner or nudge replaces it: with the new
rule every Google account is complete on arrival, so the only people it would
ever nag are future phone-only accounts, and change 6 owns that flow.

**Return to the starting page through a frontend completion route.** The
backend cannot tell at the OAuth callback whether the profile is complete — the
`User` row is created by the first `GET /api/auth/me` afterwards. So the backend
only carries the page along (`/masuk/selesai?next=<returnUrl>`) and the
frontend, once the session has loaded, decides: incomplete → profile form with
the same `next`, complete → `next`. `returnUrl` is accepted only as a path
within the app (one leading `/`, no `//`, no scheme), which closes the open
redirect an arbitrary URL would create. Alternative considered: redirect
straight to `returnUrl` and let every page check completeness — rejected, it is
the "hijack any page" behaviour this change removes.

**Side column on the profile form.** A second grid column (as on Ajukan
Pertanyaan) with "Mengapa kami meminta data ini?": what the phone and address
are for, and that neither appears on a public page. It fills the empty right
side of the page and answers the question the optional fields raise.

## Risks / Trade-offs

- [A profile saved with an empty name loses nothing today, but a future
  phone-only account could reach the app without a name] → change 6 must ask
  for it at sign-in; noted in the proposal.
- [The copy promises that an ustadz can reach the user by phone, but no screen
  exposes the number yet] → the copy says "bila perlu", describing intent; when
  a contact feature ships it must honour this wording or the copy changes.

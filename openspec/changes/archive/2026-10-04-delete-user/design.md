# Design

## Context

Deleting a `User` row cascades to their questions, answers, comments, articles and
kajian (EF `Cascade`), so a row delete would destroy the content we want to keep.
Names shown for content are read from the `User` row at request time, so changing the
row changes every place it appears. Sign-in is a JWT whose subject is the Google id;
`GetCurrentUserAsync` finds the row by Google id, and `/me` creates a row when none is
found. `Notification` stores the actor as a name string and the text already contains it.

## Goals / Non-Goals

**Goals:**
- Remove personal data, keep contributions, show "Hamba Allah".
- No old token can resurrect a deleted account.
- No change to the content tables.

**Non-Goals:**
- Undoing a deletion; it is permanent.
- Removing questions or comments other people wrote in reply to the deleted person.
- Erasing the deleted account's Google id from the database (see below).

## Decisions

**Anonymize in place.** The `User` row stays; `DeletedAt` is set; `Name` becomes
"Hamba Allah", `Email` a unique placeholder, `Picture`, `Phone`, `Address` null, `Role`
`User`, `HideAsUstadz` false. Every list, answer, comment, article, post and kajian
shows the new name without any other code changing, and the role change removes the
tick and the ustadz page. *Alternative:* delete the row and make every foreign key
nullable. Rejected: a migration plus null handling in every query for no user-visible
benefit.

**The Google id stays on the tombstone.** `GetCurrentUserAsync` treats a deleted row as
nobody (every endpoint answers 401), and `/me` first checks for a deleted row with the
token's Google id and answers signed-out instead of creating a user. Without this, an
old token (valid up to 7 days) would create a fresh account on the next `/me`. The
cost is that the Google id, an opaque identifier, stays in the database; accepted, as
it identifies nobody on its own and is what makes the rule enforceable.

**A fresh sign-in releases the id.** `/api/auth/token` (a real Google sign-in) renames
a deleted row's `GoogleId` to `deleted:{id}` before issuing the token, so the unique
index is free and `/me` creates a new account. The old tombstone stays anonymous. An
old token for that Google id then maps to the new account, which is the same person.

**Which questions go.** Delete the person's questions that have no answer or that do
not allow publishing (`!AllowPublish`); EF cascades remove their answers and comments.
Posts are never in that set, since they are answered and published. Everything else
stays. `DirectedToId` of questions directed to them is nulled.

**Notifications.** Their received notifications are deleted. Notifications they caused
live in other people's lists with their name in `Actor` and at the start of `Text`;
those rows are rewritten (name replaced by "Hamba Allah", matched on `Actor` equal to
the old name) rather than deleted, so other people do not lose unrelated history. A
different person with the same name would also be anonymized in those rows, which is
harmless. The proposal's first idea of deleting them was dropped for this reason.

**Files and profiles.** If `Picture` is an own upload (`/uploads/...`) the file is
deleted; a Google-hosted URL is just cleared. The ustadz profile, expertise and
education rows are deleted.

**Rules.** An Admin cannot delete themselves (same lockout reasoning as role changes),
which also means the last Admin is protected, since the caller is an Admin. A self
delete by an Admin is a 400 with a message. Admins may delete other Admins and Gurus.
Role changes and hiding on a deleted user return 404.

**One routine.** `AccountDeleter.DeleteAsync` does all of the above in one transaction,
used by both endpoints, so the two paths cannot differ.

**UI.** `Hapus pengguna` per row in Pengguna (not on the Admin's own row), `Hapus akun`
on Profil (not for Admin), both behind a `window.confirm` with the text in the spec.
After a self-delete the SPA calls the existing `logout()` (clears the token, opens
Masuk). The privacy paragraph in `Legal.jsx` is updated.

## Risks / Trade-offs

- Deleting is irreversible → a clear confirmation, and no undo is promised.
- A questions-with-answers asker's name is gone but their text stays, which can still
  identify them if they wrote it in → noted on the privacy page; text edits are out of
  scope.
- Name-matched notification rewrite can touch a namesake's rows → harmless.
- The tombstone keeps the Google id → needed for the stale-token rule, disclosed here.

## Migration Plan

1. Add `DeletedAt` (nullable) with an EF migration; it applies on boot.
2. Deploy the API first, then upload the UI.
3. Rollback: redeploy the previous build; the column is harmless.

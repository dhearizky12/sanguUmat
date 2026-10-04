# Design

## Context

`Role` is one of `User`, `Guru`, `Admin`, and many places test `Role == Guru` to mean
"is an ustadz": answering, the ustadz list and pages, the directed-to choice,
notifications, kajian and post credit, the tick, the featured answer, and counts.
Admins are already "staff" for seeing private questions. See proposal.md for why.

## Goals / Non-Goals

**Goals:**
- Admins can answer and be ustadz without a second account or a new role.
- One definition of "ustadz" on each side, so the next change cannot drift.
- An Admin who does not teach can opt out of every ustadz list with one switch.

**Non-Goals:**
- Hiding a Guru (only Admins can be hidden).
- Combining roles in general (a `Guru` who is also `Admin` is simply an `Admin`).
- Per-feature hiding: hidden is all-or-nothing across the lists.

## Decisions

**Two ideas, kept apart.** *May answer*: a `Guru` or any `Admin`, hidden or not,
because answering is an Admin's right and a hidden Admin may still reply. *Is an
ustadz* (presented as one): a `Guru`, or an `Admin` who is not hidden. Everything that
lists or credits an ustadz uses the second; answering and the queue use the first.

**One backend rule.** `Roles.CanAnswer(user)` and `UstadzRules` with an EF-translatable
expression `IsUstadz = u => u.Role == Guru || (u.Role == Admin && !u.HideAsUstadz)` plus
the compiled in-memory form. `UstadzController`, `Notifier`, the directed-to check,
post credit, kajian ustadz, the ustadz facet and the home count all use it, replacing
the inline `Role == Guru` tests. *Alternative:* a persisted `IsUstadz` column kept in
sync with role changes. Rejected: a second source of truth to forget to update.

**`HideAsUstadz` on `User`.** A bool, default false, set only through
`PATCH /api/admin/users/{id}/ustadz` and only for `Admin` rows. It is ignored for other
roles, so demoting a hidden Admin to Guru makes them listed again, which is what a
Guru is.

**Featured answer.** The ordering "an ustadz's answer first" becomes "a `Guru` or
`Admin` answer first" (anyone who may answer), so a hidden Admin's answer is still ranked
above a plain one when nothing else exists; only the facet and the tick use the visible
rule.

**The UI learns "ustadz" from the server.** `me`, each answer, each list item's
answerer and each article's author carry a boolean `isUstadz`. The frontend never
re-derives it from `role`, which cannot know about hiding. A small `lib/roles.js` has
`canAnswer(me)` (role test) and `isUstadz(x)` (reads the flag).

**Posts.** For an Admin, an omitted `ustadzId` defaults to themselves when they are
shown as an ustadz and is a 400 otherwise; a named one must pass the ustadz rule.
`PostForm` preselects the Admin when `me.isUstadz`.

**Earlier work by a hidden Admin.** Their answers, posts and articles stay; they show
the name with no link and no tick, because there is no ustadz page to link to.

## Risks / Trade-offs

- A forgotten `Role == Guru` leaves a feature Guru-only → the change greps for every
  occurrence in backend and frontend, and a test script exercises each area with a Guru,
  a visible Admin and a hidden Admin.
- The owner's own Admin account is an ustadz as soon as this deploys → hide it right
  after (or in the same deploy window, from Panel Admin or SQL).
- Admins now receive ustadz notifications → by design; hiding stops them.
- `isUstadz` on list items needs the answerer's flag in the projection → added next to
  the existing `AnsweredByRole`.

## Migration Plan

1. Add `HideAsUstadz` (bool, default false) with an EF migration; it applies on boot.
2. Deploy the API first, then upload the UI.
3. Hide the owner's Admin account.
4. Rollback: redeploy the previous build; the column is harmless.

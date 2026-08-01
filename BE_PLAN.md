# Sangu Umat — Backend Plan

Owned by the backend developer. See `PLAN.md` for the API contract this backlog feeds into —
update that contract's "Planned" table to "Implemented" as each item ships, so the frontend
dev knows it's safe to wire up.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done

## Phase 1 — Foundations

- [ ] **Admin bootstrap.** Add `AdminEmails` (string array) to `appsettings.json` /
  `appsettings.Development.json`. In `AuthController.Me` (backend/Controllers/AuthController.cs:47-63),
  when creating a new `User` row, set `Role = "Admin"` if the Google email matches. Solves the
  chicken-and-egg problem of getting a first Admin without touching the DB by hand.
- [ ] **Role constants + shared current-user lookup.** Add a `Roles` constants class
  (`User`/`Guru`/`Admin`) and replace the magic strings in `AnswerController.cs`. Add a small
  helper to stop repeating the `ClaimTypes.NameIdentifier` → `_db.Users.FirstOrDefaultAsync`
  lookup that's currently duplicated in `AuthController`, `QuestionController`, and
  `AnswerController`.
- [ ] **Google OAuth secret out of source.** `Program.cs:43-47` hardcodes `ClientId`/
  `ClientSecret` in a committed file. Move to user-secrets (dev) / env vars (prod), read via
  `builder.Configuration`.

## Phase 2 — Admin endpoints

- [ ] `GET /api/admin/users?search=&role=` — paginated list: id, name, email, role, createdAt,
  lastLogin. `[Authorize(Roles = "Admin")]` (or same manual-check pattern as existing
  controllers).
- [ ] `PATCH /api/admin/users/{id}/role` — body `{ role: "User"|"Guru"|"Admin" }`. Validate
  against the allowed set. Reject if `id == currentUser.Id` and new role isn't Admin (prevent
  an admin locking themselves out).

## Phase 3 — Guru workflow endpoints

- [ ] **Answered/pending signal.** `GetQuestions` (QuestionControllers.cs:46-76) currently
  returns no status. Add a computed `isAnswered` (derived from `Answers.Any()`, not stored) to
  the list response, plus a `?status=answered|pending` filter param.
- [ ] `GET /api/question/mine` — auth required, filters by current user's `UserId`. (FE has a
  client-side-filter stopgap for this today — swap it out once this lands, see `FE_PLAN.md`.)
- [ ] `PUT /api/answer/{id}` — edit an existing answer. Same owner-or-Admin permission shape as
  the existing `DeleteAnswer`.
- [x] **`DELETE /api/question/{id}`** (shipped 2026-07-21, `QuestionControllers.cs`). Permission
  shape is slightly different from `DeleteAnswer`'s owner-or-Admin: the owner can only delete
  while the question has zero answers (403 if neither owner nor Admin, 409 if owner but answers
  exist), while Admin can delete regardless of answer count (moderation shouldn't be blocked by
  that rule) — cascade delete on `Answers` already existed at the DB level (`FK_Answers_...`,
  `ReferentialAction.Cascade`) so an Admin deleting an answered question is safe. FE's existing
  wired-up button (built 2026-07-19) now works end-to-end; its generic "not supported yet" error
  message was replaced with real 403/409 handling.
- [ ] `PUT /api/question/{id}` — edit an existing question's `title`/`content` (added
  2026-07-19, FE already built and wired to this exact shape, currently gets a 405 since no
  PUT route is mapped for `api/question/{id}` — confirmed via a direct curl). Business rule
  the FE currently enforces only client-side, **needs enforcing server-side too**: only the
  question's own author can edit it, and only while it has zero answers — reject with 403/409
  if either doesn't hold (a client-side check is trivially bypassable via a direct API call).

## Phase 4 — Dashboard data (added 2026-07-18, for the new enriched Dashboard)

The frontend Dashboard now has "Terbaru Terjawab" (latest answered), "Kumpulan Jawaban
Penting" (important/verified answers grouped by category), and "Paling Banyak Dibaca" (most
read) sections. Today these are built on workarounds/placeholders because none of the
following exist. See `FE_PLAN.md` for exactly how each workaround is implemented so it's
obvious what to rip out once these ship.

- [ ] **`Category` field on `Question`.** String or enum, set at creation time.
  `CreateQuestion.jsx` already has a commented-out category `<select>` (Sholat/Puasa/Zakat/
  Keluarga & Pernikahan/Keuangan & Muamalah) that was clearly meant to feed this and never got
  wired up — reuse those category values for consistency. Add `?category=` filter support to
  `GET /api/question`. **Currently the FE fakes this** by keyword-matching each question's
  title/content against a hardcoded keyword list client-side (see `matchCategory` in
  `Dashboard.jsx`) — replace that entirely once this field is real.
- [ ] **`isAnswered` + an `AnsweredAt`-ish signal on `GET /api/question`.** Needed so "latest
  answered" can be a real sorted/filtered query instead of the FE fetching the 10 most recent
  questions and then calling `GET /api/question/{id}` on each one just to check
  `answers.length > 0`. That N+1 approach is a stopgap, not something to build further on.
- [ ] **View/read-count tracking.** `Views` (or similar) column on `Question`, incremented on
  `GET /api/question/{id}`, plus a `?sort=views` option on the list endpoint. There is currently
  zero signal for "most read" anywhere — the FE section for it is 100% static placeholder data
  (`MOST_READ_PLACEHOLDER` in `Dashboard.jsx`) with an explicit TODO comment; nothing to migrate
  from, just build the real thing and swap the placeholder out.

Note: "important answers" itself (verified-scholar answers) did **not** need a new field — the
FE derives it from the existing `role` on each answer (`role === "Guru"`), which already comes
back from `GET /api/question/{id}`.

## Phase 5 — Comments (added 2026-07-19)

`DetailQuestion.jsx` now has a comment section under each answer, but it's 100% mock — local
component state only (`src/components/CommentSection.jsx`), resets on page reload, never
touches the network. Needed to make it real:

- [ ] `Comment` model: `Id`, `Content`, `CreatedAt`, `AnswerId` (FK → `Answer`), `UserId` (FK →
  `User`). Simplest shape — one flat list per answer, no nested replies for now.
- [ ] `GET /api/answer/{answerId}/comments` — list, include commenter name/picture like
  `GetDetailQuestion` already does for answers.
- [ ] `POST /api/answer/{answerId}/comments` — auth required (any authenticated user, not
  role-gated — commenting isn't answering).
- [ ] Consider whether `GetDetailQuestion` should just include comments inline per answer
  (avoids an extra round trip per answer card) vs. a separate endpoint fetched on demand —
  frontend's call once this exists.
- [ ] `DELETE` for a comment (owner-or-Admin, same shape as `DeleteAnswer`) — not in the list
  above originally, but needed now: FE added an admin/owner delete button to the mock
  `CommentSection.jsx` (2026-07-21), currently just filtering local state since there's nothing
  to call. Add this alongside the model/GET/POST work above rather than as a follow-up.

## Notes for whoever picks this up

- No automated tests exist in the repo yet — a plain `dotnet build` + manual exercise via
  `backend.http` (or curl with a real cookie session) is the current verification method.
- CORS is currently locked to `http://localhost:3000` in `Program.cs` — fine for local dev with
  the FE dev server, revisit if that ever changes.

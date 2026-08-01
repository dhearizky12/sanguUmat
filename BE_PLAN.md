# Sangu Umat — Backend Plan

Owned by the backend developer. See `PLAN.md` for the API contract this backlog feeds into —
update that contract's "Planned" table to "Implemented" as each item ships, so the frontend
dev knows it's safe to wire up.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done

## Phase 1 — Foundations (shipped 2026-07-21)

- [x] **Admin bootstrap.** `AdminEmails` (string array) added to `appsettings.json` (empty,
  safe default) and `appsettings.Development.json` (seeded with the dev account). In
  `AuthController.Me`, a brand-new `User` row gets `Role = Roles.Admin` if its Google email
  case-insensitively matches an entry in `AdminEmails`, else `Roles.User`. Only fires for
  genuinely new logins — not exercised against any already-existing row.
- [x] **Role constants + shared current-user lookup.** Added `Models/Roles.cs`
  (`User`/`Guru`/`Admin` consts) and replaced every magic role string across `AuthController`,
  `QuestionController`, `AnswerController`, `AdminController`. Added
  `Extensions/ControllerBaseExtensions.cs` (`GetCurrentUserAsync(db)`) and replaced every
  duplicated `ClaimTypes.NameIdentifier` → `FirstOrDefaultAsync` lookup with it (kept the raw
  claim extraction only in `AuthController.Me`, since it also needs `googleId`/`email`/`name`
  individually to build a new row).
- [x] **Google OAuth secret out of source.** `Program.cs` now reads
  `Authentication:Google:ClientId`/`ClientSecret` via `builder.Configuration`, throwing at
  startup if unset. Real values moved to local `dotnet user-secrets` (`UserSecretsId` added to
  `backend.csproj`, actual secret lives outside the repo in `~/.microsoft/usersecrets/`). Prod
  equivalent: env vars `Authentication__Google__ClientId` / `...ClientSecret`.

## Phase 2 — Admin endpoints (shipped 2026-07-21)

- [x] `GET /api/admin/users?search=&role=` — `AdminController.cs`, manual-check pattern
  (401 if not logged in, 403 if not `Roles.Admin`) matching the rest of the codebase rather
  than `[Authorize(Roles=...)]`. Returns id/name/email/role/createdAt/lastLogin, no pagination
  (matches today's question-volume scale — revisit if the user table ever grows large).
- [x] `PATCH /api/admin/users/{id}/role` — validates `role` against `Roles.User/Guru/Admin`
  (400 if not one of those), rejects an admin changing their own role away from Admin (400) so
  they can't lock themselves out.

## Phase 3 — Guru workflow endpoints (shipped 2026-07-21)

- [x] **Answered/pending signal.** `GetQuestions` now returns computed `isAnswered`
  (`Answers.Any()`, not stored) plus `?status=answered|pending`. Also added `Views` and
  `CommentCount` (summed across all of a question's answers' comments) to the same response
  while touching this. No `AnsweredAt` timestamp — "latest answered" still relies on
  `CreatedAt` recency, not true answered-at order.
- [x] `GET /api/question/mine` — auth required, filters by `UserId`, same response shape as
  `GetQuestions`. Routed as a literal `"mine"` segment ahead of `"{id}"` on the same
  controller — literal segments take ASP.NET Core routing precedence over parameterized ones,
  confirmed via curl that `/api/question/14` still resolves to the detail endpoint correctly.
- [x] `PUT /api/answer/{id}` — owner-or-Admin, same shape as `DeleteAnswer`.
- [x] `DELETE /api/question/{id}` — owner-only-while-zero-answers (403/409), or Admin
  unconditionally (moderation shouldn't be blocked by that rule). Cascade delete on `Answers`
  already existed at the DB level so an Admin deleting an answered question is safe.
- [x] `PUT /api/question/{id}` — only the question's own author can edit, and only while it
  has zero answers (403/409) — no Admin bypass here, unlike delete, since editing someone
  else's question content isn't a reasonable moderation action.

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
- [x] **`isAnswered` on `GET /api/question`** (shipped 2026-07-21). Computed (`Answers.Any()`,
  not stored), plus a `?status=answered|pending` filter param — same wording as originally
  planned. Also added `CommentCount` (summed across all of a question's answers' comments)
  to the same list response while touching this. No `AnsweredAt` timestamp yet — "latest
  answered" still just relies on `CreatedAt` recency, not true answered-at order; still an
  open gap if that distinction ever matters.
- [x] **View/read-count tracking** (shipped 2026-07-21). `Views` column on `Question`, but
  **not** incremented on `GET /api/question/{id}` as originally planned — that endpoint is
  also reused as a batch data-fetch workaround by `Dashboard.jsx`/`CreateQuestion.jsx`/
  `AnswerQueue.jsx` (see `FE_PLAN.md`), so incrementing there would count every one of those
  page loads, not real visits. Instead added a dedicated `POST /api/question/{id}/view`,
  called once by `DetailQuestion.jsx` (the actual "viewing a question" page) per visit. No
  `?sort=views` param added — FE currently sorts the already-fetched answered pool client-side
  for "Paling Banyak Dibaca" instead; revisit if this needs to move server-side at scale.
- [x] **`Category` field on `Question`** (shipped 2026-07-21). Nullable string, keys match
  `src/lib/category.js` exactly (`sholat`/`puasa`/`zakat`/`keluarga`/`muamalah` — added
  `Models/Categories.cs` constants for the backend side of that same set). Validated on
  create (unrecognized/missing value silently becomes `null` = "uncategorized," not rejected —
  it's a nice-to-have tag, not a required field). `?category=` filter added to `GET
  /api/question`, and the field is included in that response, `GetMyQuestions`, and
  `GetDetailQuestion`. Existing seed rows backfilled directly against the live dev DB
  (matched by exact title, not the old keyword heuristic) and `seed-dummy-data.sql` updated
  with explicit `Category` values so a fresh setup matches. FE's `matchCategory()` keyword
  heuristic fully retired — deleted from `lib/category.js`, no callers left anywhere.

Note: "important answers" itself (verified-scholar answers) did **not** need a new field — the
FE derives it from the existing `role` on each answer (`role === "Guru"`), which already comes
back from `GET /api/question/{id}`. Still no dedicated importance/verification signal beyond
that Guru-authored check, so "Kumpulan Jawaban Penting" still draws from the same pool as
"Jawab-jawaban Terbaru" — nothing to distinguish them by yet.

## Phase 5 — Comments (added 2026-07-19, shipped 2026-07-21)

`DetailQuestion.jsx`'s comment section (`src/components/CommentSection.jsx`) is now real — no
more mock/local-only state. Delivered:

- [x] `Comment` model: `Id`, `Content`, `CreatedAt`, `AnswerId` (FK → `Answer`, cascade delete),
  `UserId` (FK → `User`, cascade delete). Flat list per answer, no nested replies.
- [x] `GET /api/answer/{answerId}/comments` — list, includes commenter name/picture.
- [x] `POST /api/answer/{answerId}/comments` — auth required, not role-gated (commenting isn't
  answering). Returns the created comment so the FE can append without a refetch.
- [x] `DELETE /api/answer/{answerId}/comments/{commentId}` — owner-or-Admin, same shape as
  `DeleteAnswer`. FE's admin/owner delete button (added 2026-07-21, previously just filtering
  local state) now calls this for real.
- Went with a separate endpoint fetched on demand rather than inlining comments into
  `GetDetailQuestion` — keeps that response light; each answer card fetches its own comments
  independently. `GetDetailQuestion` does include a per-answer `CommentCount` though (cheap
  aggregate, no join needed for a bare count).

## Notes for whoever picks this up

- Every phase above is now shipped. All new endpoints were curl-verified against the running
  local server (auth-required ones confirmed to 401 without a cookie; filters/fields checked
  against real seeded data). The one thing **not** verified end-to-end: the `AdminEmails`
  bootstrap only fires on a genuinely new Google login, which can't be driven via curl — it's
  built and compiles correctly, but needs a real browser sign-in to confirm live. The dev
  account already has `Role = "Admin"` in the local DB from earlier manual work, so the admin
  panel itself is testable right now regardless.
- No automated tests exist in the repo yet — a plain `dotnet build` + manual exercise via
  `backend.http` (or curl with a real cookie session) is the current verification method.
- CORS is currently locked to `http://localhost:3000` in `Program.cs` — fine for local dev with
  the FE dev server, revisit if that ever changes.

# Sangu Umat — Functional Plan (User → Guru → Admin)

> ## ⚠️ HARD NOTE — BAHASA INDONESIA ONLY ⚠️
> This product is for Indonesian users only. **Every single piece of user-facing text —
> labels, buttons, headings, placeholders, error/success messages, empty states, tooltips,
> alerts — MUST be written in Bahasa Indonesia. No exceptions, no English left in the UI.**
> Standing rule, see `CLAUDE.md` at the project root. Known existing English leftovers to clean
> up are listed in `FE_PLAN.md`.

## Team split

- **Backend** — backlog: `BE_PLAN.md`.
- **Frontend** — backlog: `FE_PLAN.md`.

Originally split as "backend owned separately, not this session's focus" — as of 2026-07-21
that's no longer the case; full-stack work (both plans) now happens in the same session when
needed, in dependency order (backend endpoint, then its FE consumer). The **API contract**
below stays the source of truth either way — whenever the backend adds/changes an endpoint,
update the contract and `BE_PLAN.md`'s status; whenever the frontend starts depending on a new
endpoint, check here first instead of assuming.

## API contract (source of truth for what FE can rely on)

### Implemented today (safe for FE to use now)

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/auth/login` | — | starts Google OAuth challenge |
| GET | `/api/auth/me` | cookie (optional) | `{ isAuthenticated, id, name, email, picture, role, hasCompletedProfile }`; upserts user on first login, sets `role="Admin"` if the email matches `AdminEmails` config |
| GET | `/api/auth/logout` | cookie | signs out |
| POST | `/api/auth/complete-profile` | cookie | body `{ name, phone, address }` |
| GET | `/api/auth/profile` | cookie | `{ id, name, email, picture, phone, address, role, createdAt, lastLogin }` |
| POST | `/api/auth/upload-picture` | cookie | multipart `file` → `{ picture }` |
| POST | `/api/question` | cookie | body `{ title, content, category? }` — `category` optional, unrecognized/omitted becomes `null` |
| GET | `/api/question?search=&status=&category=` | none (public) | list: `[{ id, title, content, createdAt, views, category, userId, userName, userPicture, isAnswered, commentCount }]` |
| GET | `/api/question/mine` | cookie | same shape as the list above, pre-filtered to the current user's own questions |
| GET | `/api/question/{id}` | none (public) | detail incl. `views`, `category`, `userId`, `answers: [{ id, content, createdAt, userId, userName, userPicture, role, commentCount }]` — does **not** increment views |
| POST | `/api/question/{id}/view` | none (public) | increments `Views` by 1, returns `{ views }` — call once per real page visit, never from a batch/list-workaround fetch |
| PUT | `/api/question/{id}` | cookie, owner only | body `{ title, content }`; 403 if not owner, 409 if answers exist |
| DELETE | `/api/question/{id}` | cookie, owner (zero answers only) or Admin | 403 if neither, 409 if owner but answers exist |
| POST | `/api/answer/{questionId}` | cookie, role=Guru | body `{ content }` |
| PUT | `/api/answer/{id}` | cookie, owner or role=Admin | body `{ content }` |
| DELETE | `/api/answer/{answerId}` | cookie, owner or role=Admin | |
| GET | `/api/answer/{answerId}/comments` | none (public) | list: `[{ id, content, createdAt, userId, userName, userPicture }]` |
| POST | `/api/answer/{answerId}/comments` | cookie (any authenticated user) | body `{ content }` → returns the created comment |
| DELETE | `/api/answer/{answerId}/comments/{commentId}` | cookie, owner or role=Admin | |
| GET | `/api/admin/users?search=&role=` | cookie, role=Admin | `[{ id, name, email, role, createdAt, lastLogin }]` |
| PATCH | `/api/admin/users/{id}/role` | cookie, role=Admin | body `{ role }`; 400 if invalid role or self-lockout attempt |

### Known gaps (no endpoint/field yet, not currently planned)

- No `AnsweredAt` timestamp — "latest answered" ordering relies on question `CreatedAt`.
- No dedicated "important/verified answer" signal beyond `role === "Guru"` on an answer.
- No `?sort=views` on the list endpoint — FE sorts the already-fetched set client-side instead.

## Session history

- **2026-07-19 and earlier** — frontend-only session, implementing only what the backend
  already provided (see `FE_PLAN.md`'s "Ready now" entries from that period).
- **2026-07-21** — full-stack: shipped the rest of `BE_PLAN.md` (Phases 1-5) and every FE item
  that was blocked on it, in dependency order. See `BE_PLAN.md`/`FE_PLAN.md` for specifics.

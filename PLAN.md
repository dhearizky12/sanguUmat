# Sangu Umat — Functional Plan (User → Guru → Admin)

> ## ⚠️ HARD NOTE — BAHASA INDONESIA ONLY ⚠️
> This product is for Indonesian users only. **Every single piece of user-facing text —
> labels, buttons, headings, placeholders, error/success messages, empty states, tooltips,
> alerts — MUST be written in Bahasa Indonesia. No exceptions, no English left in the UI.**
> Standing rule, see `CLAUDE.md` at the project root. Known existing English leftovers to clean
> up are listed in `FE_PLAN.md`.

## Team split

- **Backend** — owned separately (not this session's focus). Backlog: `BE_PLAN.md`.
- **Frontend** — this session's focus. Backlog: `FE_PLAN.md`.

The two are built independently but must stay in sync through the **API contract** below —
whenever the backend adds/changes an endpoint, update the contract and `BE_PLAN.md`'s status;
whenever the frontend starts depending on a new endpoint, check here first instead of assuming.

## API contract (source of truth for what FE can rely on)

### Implemented today (safe for FE to use now)

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/auth/login` | — | starts Google OAuth challenge |
| GET | `/api/auth/me` | cookie (optional) | `{ isAuthenticated, id, name, email, picture, role, hasCompletedProfile }`; upserts user on first login |
| GET | `/api/auth/logout` | cookie | signs out |
| POST | `/api/auth/complete-profile` | cookie | body `{ name, phone, address }` |
| GET | `/api/auth/profile` | cookie | `{ id, name, email, picture, phone, address, role, createdAt, lastLogin }` |
| POST | `/api/auth/upload-picture` | cookie | multipart `file` → `{ picture }` |
| POST | `/api/question` | cookie | body `{ title, content }` |
| GET | `/api/question?search=` | none (public) | list: `[{ id, title, content, createdAt, userId, userName, userPicture }]` — **no answered/pending signal, no per-user filter** |
| GET | `/api/question/{id}` | none (public) | detail incl. `answers: [{ id, content, createdAt, userId, userName, userPicture, role }]` |
| POST | `/api/answer/{questionId}` | cookie, role=Guru | body `{ content }` |
| DELETE | `/api/answer/{answerId}` | cookie, owner or role=Admin | |

### Planned (backend not built yet — do not wire FE to these until `BE_PLAN.md` marks them done)

| Method | Path | Unblocks (FE) |
|---|---|---|
| GET | `/api/admin/users?search=&role=` | Admin user-management page |
| PATCH | `/api/admin/users/{id}/role` | Admin role assignment |
| GET | `/api/question/mine` | Real "Pertanyaan Saya" (currently must client-filter as a stopgap) |
| PUT | `/api/answer/{id}` | Edit-answer UI |
| DELETE | `/api/question/{id}` | Delete-question UI |
| GET | `/api/question` gains `isAnswered` + `?status=` | Answered/pending filter, Guru queue |

## This session

Per instruction: **implement only what the backend already provides** — everything in
`FE_PLAN.md`'s "Ready now" section. Nothing that depends on the "Planned" table above.

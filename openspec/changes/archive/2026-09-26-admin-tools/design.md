# Design

## Context

- **What Admins can already do:** existing endpoints already let an Admin delete
  any question (and notify the asker), answer, comment, article and kajian.
- **What's missing:** a way to *find* those items.
- **Admin checks:** Panel Admin pages sit behind `RoleGuard allow={["Admin"]}`,
  and admin endpoints check the role themselves (`RequireAdminAsync` in
  `CategoriesController`).

## Goals / Non-Goals

**Goals:**
- **Read-only and additive:** new list endpoints, and every destructive action
  through the endpoints and rules that already exist.
- **Admins see the truth:** no anonymous masking and no consent filter in these
  lists.

**Non-Goals:**
- Editing others' content.
- Bulk actions.
- Audit trails.
- Charts.

## Decisions

### One `AdminContentController`

It lives at `api/admin`, with `overview`, `questions`, `comments`, `articles`
and `kajian`, sharing a `RequireAdminAsync` helper and a paging helper
(20 a page, clamped like the other lists). Queries run in SQL, with
`Skip`/`Take` on an ordered `IQueryable`, since these lists have no facets to
count in memory.

- **Kajian status filtering in SQL** uses the same per-row interval
  expressions as `KajianController`.
- **Status labels** use `KajianClock.StatusOf`.

### Overview counts

The overview is a handful of `CountAsync` calls. "This week" means the last
seven days from now (UTC). A cache was rejected: the numbers are cheap, and
Admins expect them fresh.

### Frontend

- **Shared list shell:** `components/admin/AdminList.jsx` holds the search box
  (debounced into `?search=`), status chips (`?status=`), pagination
  (`?page=`) and the loading and empty states. The four pages pass it a fetch
  URL and a row renderer.
- **Deleting** is `window.confirm` followed by the existing endpoint, then the
  row is removed from local state and the list refetched, so totals stay
  right.
- **Wide tables:** on wide screens rows use a grid like Pengguna does. On
  phones they stack.

## Risks / Trade-offs

- **[Large tables]** `ILIKE` search over questions and comments has no index. →
  Fine at this scale; the same trade-off as elsewhere.
- **[Mis-clicks on Hapus]** → Always confirm, naming what will be deleted.

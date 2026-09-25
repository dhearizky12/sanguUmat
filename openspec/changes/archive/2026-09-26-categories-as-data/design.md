## Context

`Questions.Category` is a nullable string holding one of five keys, validated
against `Models/Categories.cs`; anything else is stored as `null`. The frontend
maps keys to labels with `lib/category.js`, which nine files import. Panel Admin
today is one page, `/admin/users`, behind `RoleGuard allow={["Admin"]}`. EF
migrations run on boot, so a migration must succeed against every existing
database, including ones holding values the old code never wrote.

## Goals / Non-Goals

**Goals:**
- One source of categories — the table — read by both ends.
- An upgrade that keeps every question's category without manual steps.

**Non-Goals:**
- Hiding or archiving a category (deleting moves its questions to "Lainnya", as
  decided).
- Category descriptions, icons or per-category pages.
- Moving questions between categories in bulk, or changing a question's
  category after it is asked.
- Facet counts on the questions endpoint — change 3.

## Decisions

**A `Categories` table, and `Questions.CategoryId` as a nullable foreign key
with `ON DELETE SET NULL`.** Columns: `Id`, `Key` (unique), `Name`,
`SortOrder`, `CreatedAt`. The database then does "delete moves questions to
Lainnya" itself, atomically. Alternative considered: keep the string column and
clear it in the delete endpoint — rejected; it leaves no referential integrity,
so a renamed or deleted key could silently orphan questions.

**Keys are derived once and never change.** Lower-cased, diacritics removed,
runs of non-letters and non-digits become one hyphen, trimmed ("Keluarga &
Pernikahan" → `keluarga-pernikahan`). The five existing keys are seeded as they
are (`keluarga`, `muamalah`, …), not re-derived, so URLs, filters and stored
data stay valid. Renaming changes only `Name`.

**API responses keep `category` as the key.** Question list, detail and "mine"
responses map `Category.Key`; `POST /api/question` and `?category=` still take
a key. The frontend change is therefore about labels and lists, not about data
shapes.

**The migration seeds, backfills, then drops.** In order: create
`Categories`; insert the twelve topics with `SortOrder` 1–12; add `CategoryId`;
`UPDATE Questions SET CategoryId = c.Id FROM Categories c WHERE c.Key =
Questions.Category` (unknown strings become `NULL`, which is what the old code
showed as "Lainnya"); drop `Category`. `Down` reverses it, restoring keys from
the join.

**Reordering stores a position and renumbers.** `PUT` with `sortOrder` moves
that category to the position and renumbers the rest 1…n in one transaction,
so positions never collide or gap. The page offers "Naik"/"Turun", each a single
`PUT`.

**Frontend: one cached fetch.** `lib/category.js` becomes a `useCategories()`
hook backed by a module-level promise, so the list is fetched once per page
load and shared by every component; `categoryLabel(categories, key)` returns
the name or "Lainnya". After an Admin edits on the Kategori page, the cache is
refreshed.

**Panel Admin sub-navigation.** An `AdminNav` ("Pengguna" · "Kategori") in both
admin pages' header band, and a new `/admin/categories` route under the same
Admin-only guard. The header's "Panel Admin" link already matches any `/admin`
path.

## Risks / Trade-offs

- [Deleting a busy category re-labels many questions at once] → the page's
  confirmation states the count from `questionCount` before anything happens.
- [A name that slugs to an existing key, e.g. "Sholat!" beside "Sholat"] →
  rejected with 409 rather than suffixing, so two categories never look alike.
- [The seed runs inside the migration, so an Admin cannot choose the initial
  set] → it is the design's set, as decided; the Admin edits from there.

## Migration Plan

Deploy as usual; the API applies the migration on boot. Rollback: `dotnet ef
database update AddUniqueGoogleId` runs `Down`, which restores the string
column from the join, then redeploy the previous image. Categories added after
the upgrade are lost on rollback; their questions come back uncategorised.

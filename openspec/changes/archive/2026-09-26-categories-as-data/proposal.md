## Why

Question categories are a fixed five-key list hard-coded twice — in
`backend/Models/Categories.cs` and `frontend/src/lib/category.js` — so every new
topic needs a code change on both ends and a deploy. The design already
organises Tanya Jawab around twelve topics. Categories need to be data an Admin
manages from Panel Admin, which is also what the filter counts in roadmap change
3 build on.

## What Changes

Both backend and frontend.

- Categories move into a database table: a stable key, a display name and a
  sort order. The table starts with the design's twelve topics (today's five
  keys kept as they are, plus Thaharah, Makanan & Minuman, Haji & Umrah, Akhlak,
  Aqidah, Jenazah and Isu Kontemporer). Questions keep their current category
  through a backfill; uncategorised questions stay uncategorised ("Lainnya").
- A category stays optional when asking a question.
- New endpoints:
  - `GET /api/categories` — public; `200` with `[{ key, name, sortOrder, questionCount }]`
    in sort order.
  - `POST /api/admin/categories` — Admin only; body `{ name }`; `201` with the
    created category, `400` for an empty name, `409` when the name is taken.
  - `PUT /api/admin/categories/{key}` — Admin only; body `{ name?, sortOrder? }`;
    `200` with the updated category, `404` if unknown, `409` on a taken name.
  - `DELETE /api/admin/categories/{key}` — Admin only; `204`. Questions that used
    it become uncategorised and show as "Lainnya".
  - All admin endpoints answer `401` signed out and `403` for a non-Admin.
- The key is derived from the name when a category is created and never changes,
  so links and filters stay stable when an Admin renames a category.
- Existing question endpoints keep their shapes: `category` is still the key (or
  `null`), and `?category=<key>` still filters.
- Panel Admin gains a "Kategori" page beside "Pengguna": list with question
  counts, add, rename, reorder and delete (with a confirmation naming how many
  questions will become "Lainnya").
- The frontend reads categories from `GET /api/categories` everywhere it uses the
  hard-coded list today: the home topic index, the Tanya Jawab and Jawab
  Pertanyaan filters, the Ajukan category picker, and every category label.

## Capabilities

### New Capabilities

- `categories`: the category list as data — reading it, and an Admin adding,
  renaming, reordering and deleting categories.

### Modified Capabilities

- `questions`: the "Categories" requirement (a fixed set kept in two source
  files) is removed in favour of `categories`. Asking, browsing and filtering
  keep their behaviour.

## Impact

- Backend: a new `Category` model, `DbSet`, and an EF migration that creates the
  table, seeds the twelve topics, moves `Questions.Category` (a string) to a
  nullable foreign key, and backfills it. New `CategoriesController` and admin
  category endpoints; `QuestionController` validates against the table.
  `Models/Categories.cs` is removed.
- Frontend: `lib/category.js` becomes a small fetch-and-cache hook; the pages
  above switch to it; a new `/admin/categories` page and an admin sub-navigation.
- Roadmap change 3 (`listing-sort-pagination-facets`) can reuse
  `questionCount` for its category facet.

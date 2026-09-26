## Why

Tanya Jawab loads every published question in one response and filters them in
the browser. That stops scaling as answers accumulate, and it cannot do what the
Tanya Jawab canvas shows: a facet panel for Kategori and Ustadz with counts, a
sort control, and numbered pages. The roadmap puts sort, paging and facets on
the questions endpoint once, so Artikel and Ngaji Bareng can reuse the pattern.

## What Changes

Both backend and frontend.

- New endpoint `GET /api/question/browse` — public. Query: `search`, `category`
  (repeatable, category keys), `ustadz` (repeatable, user ids of Gurus), `sort`
  (`terbaru` default, `terlama`, `populer`, `singkat`, `abjad`), `page` (from
  1), `pageSize` (default 8, at most 50). Returns
  `{ items, total, totalPublished, page, pageSize, totalPages, facets: { categories: [{ key, name, count }], ustadz: [{ id, name, picture, count }] } }`.
  Items have the same shape as `GET /api/question` items, which gain
  `readMinutes` as an added field.
  Only published (answered) questions are included, as everywhere else.
- Facet semantics follow the canvas: several values in one facet widen the
  result (OR), different facets narrow it (AND), and each facet's counts are
  computed over the search and the *other* facet, so a count always says how
  many results picking that value would add.
- The Ustadz facet lists the Gurus who have answered published questions, each
  question credited to its featured (Guru) answer. Ustadz profile pages stay in
  roadmap change 4.
- "Waktu baca" is estimated from the featured answer at 200 words a minute,
  minimum one minute, and shown on each row.
- Tanya Jawab is rebuilt to the canvas:
  - left facet panel (232px, sticky; stacked above the list below 900px) with
    Kategori and Ustadz, each with an in-facet search and every value as a
    check-box list with counts, scrolling past nine rows, and "Semua" to clear
    the facet;
  - results bar with "N dari M jawaban", the sort select ("Urutkan") and the
    one/two-column toggle;
  - "Saringan aktif" chips for each chosen value and the search, with "Hapus
    semua";
  - numbered pagination — "Halaman X dari Y", "Sebelumnya", page numbers,
    "Berikutnya" — eight per page;
  - the empty state "Belum ada jawaban yang cocok." with "Atur ulang saringan".
- Search, facets, sort and page live in the URL, so a filtered page can be
  shared and the back button works; any filter change returns to page 1.
- `GET /api/question` is unchanged, so the home page, the answer queue and the
  question sidebar keep working as they are.

## Capabilities

### New Capabilities

- `question-browsing`: the paged, sortable, faceted listing of published
  questions that Tanya Jawab is built on.

### Modified Capabilities

None. `questions` keeps its existing listing endpoint and rules.

## Impact

- Backend: a `browse` action on `QuestionController` with its query, sort, paging
  and facet aggregation; a shared "featured answer" rule used by it and the
  existing list.
- Frontend: `pages/Questions.jsx` rebuilt; a `FacetPanel` component, a
  `Pagination` component, a sort select and the column toggle, and URL-state
  helpers. `QuestionRow` gains the read-time count.
- Roadmap: change 4 (`ustadz-profiles`) no longer needs to add the Ustadz facet,
  only the profile pages it links to.

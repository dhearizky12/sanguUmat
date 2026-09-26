## Context

`GET /api/question` returns every published question; `Questions.jsx` filters by
category in the browser. The featured-answer rule ("a Guru's answer if any,
otherwise the first") lives inline in two projections of that endpoint.
Categories are a table with keys; questions carry `CategoryId`. There is no
read-time data. Local data is ~33 published questions; production volume is
unknown but growing.

## Goals / Non-Goals

**Goals:**
- One server endpoint that does search, facets, sort, paging and counts, so the
  browser never needs the full list.
- The canvas's interaction model, including its facet-count semantics.

**Non-Goals:**
- Ustadz profile pages or a Dewan Ustadz listing — change 4.
- Changing `GET /api/question`, the home page, or the Guru queue.
- Full-text search beyond the current case-insensitive "contains".

## Decisions

**A new `/api/question/browse` endpoint rather than reshaping `GET /api/question`.**
Three screens consume the array the list returns today. A new endpoint lets
Tanya Jawab move to the paged envelope without touching them. Alternative
considered: add paging parameters to the existing endpoint and switch the
response shape when they are present — rejected; one URL with two shapes is a
trap for every future caller.

**Featured answer as one shared projection.** One projection turns a question
query into list items, picking the featured answer (Guru first, then earliest)
for `answeredBy*` and the browse fields. The existing list, "mine" and browse
all use it, replacing the inline copies. The answerer id it carries for filtering
is not serialised; the lists gain only `readMinutes`, an added field.

**Facet counts exclude their own facet ("multi-select faceting").** Category
counts are computed over search + ustadz filter; ustadz counts over search +
category filter; items over all of them. This is what the canvas does and it is
what makes multi-select usable — a checked category never drives the others'
counts to zero.

**Filter, count, sort and page over a lightweight index, then load one page.**
One SQL query applies the published rule and the search and returns only what
filtering and sorting need per question (id, category key, featured answerer
id and role, created date, views, title, featured answer length). Facet counts,
the facet filters, the sort and the page are computed over those rows in memory,
and only the page's ids are then loaded as full list items. EF cannot translate
grouping on correlated "featured answer" subqueries reliably; this keeps every
query simple and is fast into the tens of thousands of questions. Move the
aggregation into SQL (or a materialised featured-answer column) beyond that.

**Read time is estimated from length, not stored.** The featured answer's length
÷ 1,200 characters (≈6 characters a word at 200 words a minute), rounded up,
minimum 1. Length is translatable to SQL where a word count is not, and sorting
by it uses the same number the row shows. Storing it would add a column that
goes stale on every answer edit.

**Paging clamps rather than errors.** A page past the end returns the last page
and reports it, so a shared link to page 5 still shows results after questions
are removed.

**URL is the single source of UI state.** `search`, `category` (repeated),
`ustadz` (repeated), `sort` and `page` are read from and written to the query
string; the page renders from them and fetches on change. The in-facet search
boxes and "Lihat semua" stay local, as in the canvas.

**Components.** `FacetPanel` (one facet section: search, check-box list, top-N,
pinning, "Lihat semua"), `Pagination`, and a `SortSelect` built on the existing
`Select`. The column toggle reuses the icons from the home list section. The
row gains a clock icon with `readMinutes` beside the view and comment counts.

## Risks / Trade-offs

- [Computed read time and grouped facet counts run per request] → fine at
  current volume; the design names the indexed-column upgrade if needed.
- [The featured answer can change when a Guru answers after a non-Guru] → facets
  and credits follow it automatically; that is the intended behaviour.
- [Multiple values in the URL (`category=a&category=b`)] → standard repeated
  query parameters, read with `URLSearchParams.getAll`.

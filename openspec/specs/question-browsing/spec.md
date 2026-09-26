# question-browsing Specification

## Purpose
The paged, sortable and faceted listing of published questions behind Tanya
Jawab — search, filter by category and ustadz with counts, sort, and move
between pages — so browsing stays fast as answers accumulate.

## Requirements

### Requirement: Browsing endpoint

Anyone MUST be able to page through published questions with search, facets and
sort from one endpoint. Unanswered questions MUST never appear in it.

#### Scenario: Default page

- **WHEN** anyone requests `GET /api/question/browse`
- **THEN** the response is 200 with `{ items, total, totalPublished, page, pageSize, totalPages, facets }`
- **AND** `items` holds the first 8 published questions, newest first, each
  shaped like a `GET /api/question` item, including `readMinutes`
- **AND** `total` counts every published question matching the query,
  `totalPublished` counts every published question, and `totalPages` is at
  least 1

#### Scenario: Paging

- **WHEN** `?page=2` is given
- **THEN** items 9–16 of the same order are returned
- **WHEN** the page is past the last one
- **THEN** the last page is returned and `page` says which
- **WHEN** `?pageSize=` is given
- **THEN** it is used, capped at 50; a value below 1 falls back to 8

#### Scenario: Sorting

- **WHEN** `?sort=` is `terbaru`, `terlama`, `populer`, `singkat` or `abjad`
- **THEN** items are ordered newest first, oldest first, most views first,
  shortest read first, or by title A–Z respectively, with newest first breaking
  ties
- **WHEN** `sort` is missing or unknown
- **THEN** `terbaru` applies

#### Scenario: Search

- **WHEN** `?search=` is given
- **THEN** only questions whose title or body contains it, case-insensitively,
  are counted and returned

#### Scenario: Facet filters

- **WHEN** one or more `?category=` keys are given
- **THEN** questions in any of those categories match
- **WHEN** one or more `?ustadz=` ids are given
- **THEN** questions whose featured answer is by any of those Gurus match
- **WHEN** both are given
- **THEN** a question must match both

#### Scenario: Facet counts

- **WHEN** the response is built
- **THEN** `facets.categories` lists every category with how many matching
  questions it has, counted over the search and the ustadz filter but not the
  category filter
- **AND** `facets.ustadz` lists every Guru who is the featured answerer of a
  published question, with the same kind of count over the search and the
  category filter

#### Scenario: Read time

- **WHEN** an item is returned
- **THEN** `readMinutes` estimates reading its featured answer at 200 words a
  minute from its length (about 6 characters a word, so length ÷ 1,200),
  rounded up, and at least 1
- **AND** the "singkat" sort orders by that same estimate

### Requirement: Tanya Jawab page

Tanya Jawab MUST follow the Tanya Jawab canvas: a facet panel beside the
results, a sort control, active-filter chips and numbered pagination, all in
Bahasa Indonesia.

#### Scenario: Facet panel

- **WHEN** the page is wider than 900px
- **THEN** a 232px panel sits beside the results and stays in view while
  scrolling, with a "Kategori" and an "Ustadz" section
- **AND** each section has a search box ("Cari kategori" / "Cari ustadz"), and
  lists every value, most-used first, as check boxes with counts, in a list that
  scrolls once it passes nine rows, with a "Semua" link that clears the section
- **WHEN** the page is 900px or narrower
- **THEN** the panel sits above the results

#### Scenario: Results bar

- **WHEN** results are shown
- **THEN** the bar reads "N dari M jawaban", offers "Urutkan" with Terbaru,
  Terlama, Paling banyak dibaca, Waktu baca tersingkat and Judul A–Z, and a
  one/two-column toggle on wide screens

#### Scenario: Active filters

- **WHEN** a category, an ustadz or a search is active
- **THEN** "Saringan aktif" lists each as a chip that removes it, followed by
  "Hapus semua"

#### Scenario: Pagination

- **WHEN** there are results
- **THEN** below them are "Halaman X dari Y", "Sebelumnya", the page numbers and
  "Berikutnya", with the current page highlighted and "Sebelumnya" /
  "Berikutnya" disabled at the ends

#### Scenario: State in the URL

- **WHEN** a visitor changes the search, a facet, the sort or the page
- **THEN** the URL records it, so reloading or sharing the link shows the same
  results and the back button returns to the previous state
- **AND** any change other than the page returns to page 1

#### Scenario: No results

- **WHEN** nothing matches
- **THEN** the page shows "Belum ada jawaban yang cocok." with "Atur ulang
  saringan", which clears every filter and the search

## MODIFIED Requirements

### Requirement: Browsing endpoint

Anyone MUST be able to page through published questions — answered, with the
asker's consent — with search, facets and sort from one endpoint. Unanswered
questions and private answers MUST never appear in it.

#### Scenario: Default page

- **WHEN** anyone requests `GET /api/question/browse`
- **THEN** the response is 200 with `{ items, total, totalPublished, page, pageSize, totalPages, facets }`
- **AND** `items` holds the first 8 published questions, newest first, each
  shaped like a `GET /api/question` item (asker masked when anonymous),
  including `readMinutes`
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

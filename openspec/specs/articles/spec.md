# articles Specification

## Purpose

Long-form articles by the ustadz. A Guru writes and publishes their own and an
Admin can manage any, while anyone can read and browse the published ones by
rubrik, author, search and sort. This gives the deeper, structured writing a
home beside the short answers of Tanya Jawab.

## Requirements

### Requirement: Article

An article MUST have a title, an optional summary, a body of formatted text, an
optional cover image, an optional category (its rubrik), an author, and a
status of draft or published.

#### Scenario: Draft and published

- **WHEN** an article is saved without publishing
- **THEN** it is a draft, visible only to its author and to Admins
- **WHEN** it is published
- **THEN** it records when it was first published and appears in the Artikel list
- **AND** unpublishing it later makes it a draft again, and publishing again
  keeps the original published date

#### Scenario: No category

- **WHEN** an article has no category, or its category is deleted
- **THEN** it is labelled "Lainnya"

#### Scenario: Read time

- **WHEN** an article is returned
- **THEN** `readMinutes` estimates reading its body text, with the tags
  stripped, at 200 words a minute, rounded up and at least 1

#### Scenario: Summary

- **WHEN** an article has no summary
- **THEN** lists show the first 200 characters of its body text instead, cut at
  a word and ending in "…"

### Requirement: Safe formatting

An article body MUST only ever contain safe formatting, whatever the client
sends.

#### Scenario: Allowed formatting

- **WHEN** an article is saved
- **THEN** its body keeps only paragraphs, line breaks, the h2 and h3 headings,
  bold, italic, underline, strikethrough, block quotes, bulleted and numbered
  lists, horizontal rules, and links
- **AND** links keep only an `http`, `https` or `mailto` address, and open in a
  new tab with `rel="noopener noreferrer nofollow"`
- **AND** every other tag is removed with its text kept, and every attribute,
  style or script is removed

#### Scenario: Empty body

- **WHEN** the body has no text left once the tags are removed
- **THEN** it is treated as empty

### Requirement: Writing articles

A Guru MUST be able to write, edit, publish, unpublish and delete their own
articles. An Admin MUST be able to write articles and do all of that to any
article. Nobody else may.

#### Scenario: Creating

- **WHEN** a Guru or an Admin posts `{ title, summary, body, cover, category,
  publish }` to `POST /api/articles`
- **THEN** the article is created with them as its author, as a draft or
  published according to `publish`, and the response is 201 with the article
- **AND** an unknown category key is stored as no category

#### Scenario: Editing

- **WHEN** the author or an Admin puts the same shape to `PUT /api/articles/{id}`
- **THEN** the article is replaced by it, its status follows `publish`, and the
  response is 200 with the article
- **AND** an Admin editing someone else's article leaves the author unchanged

#### Scenario: Validation

- **WHEN** the title is empty
- **THEN** the response is 400 with "Judul artikel harus diisi"
- **WHEN** the title is longer than 160 characters
- **THEN** the response is 400 with "Judul maksimal 160 karakter"
- **WHEN** the summary is longer than 300 characters
- **THEN** the response is 400 with "Ringkasan maksimal 300 karakter"
- **WHEN** publishing with an empty body
- **THEN** the response is 400 with "Isi artikel harus diisi sebelum diterbitkan"
- **WHEN** the body is longer than 100.000 characters
- **THEN** the response is 400 with "Isi artikel terlalu panjang"
- **AND** a draft may be saved with only a title

#### Scenario: Deleting

- **WHEN** the author or an Admin sends `DELETE /api/articles/{id}`
- **THEN** the article is removed and the response is 204

#### Scenario: Not allowed

- **WHEN** a signed-out caller creates, edits, deletes or uploads a cover
- **THEN** the response is 401
- **WHEN** a signed-in caller who is neither a Guru nor an Admin creates or
  uploads a cover
- **THEN** the response is 403
- **WHEN** a signed-in caller who is neither the article's author nor an Admin
  edits or deletes it
- **THEN** the response is 403 and nothing changes
- **WHEN** the author is no longer a Guru
- **THEN** only an Admin may edit or delete their articles, and the published
  ones stay published under their name
- **WHEN** the id does not exist
- **THEN** the response is 404

#### Scenario: My articles

- **WHEN** a Guru or an Admin requests `GET /api/articles/mine`
- **THEN** the response is 200 with every article they wrote, drafts included,
  most recently updated first, each with its `status` and `updatedAt`

### Requirement: Cover image

A Guru or an Admin MUST be able to upload a cover image for an article.

#### Scenario: Uploading

- **WHEN** a Guru or an Admin posts an image to `POST /api/articles/cover`
- **THEN** it is stored and the response is 200 with `{ cover }`, a
  server-relative `/uploads/articles/...` path to put in the article's `cover`

#### Scenario: Wrong file

- **WHEN** the file is empty
- **THEN** the response is 400 with "Berkas kosong"
- **WHEN** it is not a JPG, PNG or WebP image
- **THEN** the response is 400 with "Sampul harus berupa gambar JPG, PNG atau WebP"
- **WHEN** it is larger than 5 MB
- **THEN** the response is 400 with "Ukuran sampul maksimal 5 MB"

#### Scenario: Cover from elsewhere

- **WHEN** an article is saved with a `cover` that is not one of our
  `/uploads/articles/` paths
- **THEN** it is stored as no cover

### Requirement: Reading articles

Anyone MUST be able to read a published article and have the read counted.

#### Scenario: One article

- **WHEN** anyone requests `GET /api/articles/{id}` for a published article
- **THEN** the response is 200 with `{ id, title, summary, cover, category,
  author: { id, name, picture, role }, publishedAt, updatedAt, readMinutes,
  views, status, body }`
- **WHEN** it is a draft and the caller is its author or an Admin
- **THEN** the same is returned
- **WHEN** it is a draft and the caller is anyone else, or the id does not exist
- **THEN** the response is 404

#### Scenario: Counting a read

- **WHEN** anyone posts to `POST /api/articles/{id}/view` for a published article
- **THEN** its read count goes up by one and the response is 200 with `{ views }`
- **WHEN** it is a draft or does not exist
- **THEN** the response is 404 and nothing is counted

### Requirement: Browsing articles

Anyone MUST be able to page through published articles with search, facets and
sort from one endpoint, working the same way as question browsing. Drafts MUST
never appear in it.

#### Scenario: Default page

- **WHEN** anyone requests `GET /api/articles`
- **THEN** the response is 200 with `{ items, lead, total, totalPublished, page,
  pageSize, totalPages, facets }`
- **AND** `items` holds the first 8 published articles, newest published first,
  each as `{ id, title, summary, cover, category, author: { id, name, picture },
  publishedAt, readMinutes, views }`, with the summary filled in as described
  under Summary

#### Scenario: Paging

- **WHEN** `?page=` is given
- **THEN** that page is returned, and a page past the last returns the last one
- **WHEN** `?pageSize=` is given
- **THEN** it is used, capped at 50; a value below 1 falls back to 8

#### Scenario: Sorting

- **WHEN** `?sort=` is `terbaru`, `terlama`, `populer`, `singkat` or `abjad`
- **THEN** items are ordered newest published first, oldest first, most read
  first, shortest read first, or by title A–Z, with newest first breaking ties
- **WHEN** `sort` is missing or unknown
- **THEN** `terbaru` applies

#### Scenario: Lead article

- **WHEN** `?lead=1` is given, with no search, category or author filter and the
  Terbaru sort
- **AND** more than three articles are published and the newest has a cover
- **THEN** that newest article is left out of the paged list and returned as
  `lead` on every page, and `total` and `totalPages` count the rest
- **WHEN** any of that does not hold
- **THEN** `lead` is null and the list is unchanged

#### Scenario: Search

- **WHEN** `?search=` is given
- **THEN** only articles whose title, summary or body text contains it,
  case-insensitively, are counted and returned

#### Scenario: Facets

- **WHEN** one or more `?category=` keys or `?author=` ids are given
- **THEN** articles in any of the categories and by any of the authors match,
  and both facets together narrow
- **AND** `facets.categories` lists every category with how many matching
  published articles it has, counted over the search and the author filter but
  not the category filter
- **AND** `facets.authors` lists every author of a published article as `{ id,
  name, count }`, counted over the search and the category filter

### Requirement: Artikel page

Artikel MUST follow the Artikel canvas, in the design system and in Bahasa
Indonesia, leaving out membership, which is not planned.

#### Scenario: Layout

- **WHEN** anyone opens `/articles`
- **THEN** they see the page header ("Artikel" and its lead line), the search
  box, and a facet panel with "Rubrik" and "Penulis" beside the results (above
  them at 900px or narrower)
- **AND** a results bar with "N dari M artikel", "Urutkan" with the five sorts,
  and a one/two-column toggle on wide screens
- **AND** "Saringan aktif" chips with "Hapus semua" whenever a filter or search
  is active

#### Scenario: Sorotan

- **WHEN** the list is on page 1, sorted by Terbaru, in one column, with no
  search or filter, holds more than three articles, and the newest has a cover
- **THEN** the page asks for the lead article, and the newest is shown first as
  a large "Sorotan" item with its cover,
  rubrik, date, read time, title, summary and author
- **AND** the rest follow in the normal list, eight a page

#### Scenario: Article items

- **WHEN** an article is listed
- **THEN** it shows its cover when it has one, rubrik, date, "N menit
  baca", title, summary, "Oleh" and the author, and "N dibaca", and links to its
  page

#### Scenario: Pagination and URL

- **WHEN** there are results
- **THEN** numbered pagination follows them as on Tanya Jawab
- **AND** the search, facets, sort and page are kept in the URL, and any change
  other than the page returns to page 1

#### Scenario: No results

- **WHEN** nothing matches
- **THEN** the page shows "Belum ada artikel yang cocok." with "Atur ulang
  saringan"
- **WHEN** no article has been published at all
- **THEN** the page says "Belum ada artikel." instead

#### Scenario: Membership parts left out

- **WHEN** the page is shown
- **THEN** it has no "Khusus Anggota" tag, no "Akses" facet and no "Jadi Anggota"
  banner

### Requirement: Article page

Each published article MUST have its own page.

#### Scenario: Reading

- **WHEN** anyone opens `/articles/{id}`
- **THEN** they see a breadcrumb Artikel › rubrik, the rubrik, title and
  summary, the author with their avatar (with the gold tick and a link to their
  ustadz page when they are an ustadz), the published date, "N menit baca" and "N
  dibaca", the cover, and the formatted body
- **AND** one read is counted

#### Scenario: Managing from the page

- **WHEN** the author or an Admin views the article
- **THEN** it offers "Ubah artikel" and "Hapus", which asks to confirm first
- **WHEN** they view a draft
- **THEN** a notice says "Draf — belum diterbitkan" and no read is counted

#### Scenario: Missing article

- **WHEN** the id does not exist or is a draft the viewer may not see
- **THEN** the page shows "Artikel tidak ditemukan." with a link back to Artikel

#### Scenario: The old placeholder link

- **WHEN** anyone opens `/detail-article/{anything}`
- **THEN** they are redirected to `/articles`

### Requirement: Writing pages

A Guru and an Admin MUST have pages to write articles and to find their own.

#### Scenario: Write and edit

- **WHEN** a Guru or an Admin opens `/articles/tulis`, or the author or an Admin
  opens `/articles/{id}/ubah`
- **THEN** they get fields for the title and summary (each with a character
  count), the rubrik, and the cover (upload, preview, "Hapus sampul")
- **AND** a rich text editor with a toolbar for heading, subheading, bold,
  italic, underline, strikethrough, quote, bulleted and numbered list,
  horizontal rule, link, undo and redo
- **AND** "Simpan draf" and "Terbitkan" (or "Simpan perubahan" and
  "Batalkan terbit" once published), showing the server's error message if
  saving fails
- **WHEN** saving succeeds
- **THEN** they are taken to the article's page

#### Scenario: Leaving with unsaved changes

- **WHEN** they reload or close the page with unsaved changes
- **THEN** the browser asks them to confirm

#### Scenario: Not allowed

- **WHEN** anyone else opens a write or edit page
- **THEN** a signed-out visitor is sent to sign in, and a signed-in one to
  `/articles` (or to the article's page, for an edit)

#### Scenario: Artikel saya

- **WHEN** a Guru or an Admin opens `/articles/saya`
- **THEN** they see their articles, most recently updated first, each with
  "Draf" or "Terbit", its date, and links to open and edit it, plus "Tulis
  artikel"
- **WHEN** they have none
- **THEN** it says "Belum ada artikel." and offers "Tulis artikel"

#### Scenario: Finding the pages

- **WHEN** a Guru or an Admin is signed in
- **THEN** the Artikel page offers "Tulis artikel" and "Artikel saya", and so
  does their Profil page

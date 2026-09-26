# Tasks

## 1. Backend

- [x] 1.1 Add the `Article` model (with `BodyText` and `ReadMinutes`), its
      `DbSet`, foreign keys (category SET NULL, author CASCADE) and indexes, and
      the migration. Verify on a scratch copy of the local database: the
      migration applies and rolls back to `UstadzProfiles`.
- [x] 1.2 Add `HtmlSanitizer` and an `ArticleHtml` helper that returns clean HTML,
      its text and its read minutes, with the allowlist from design.md and
      `target`/`rel` on links. Verify with curl through 1.4 that `<script>`,
      `onclick`, `style`, `javascript:` links and `<img>` are removed, text in
      unknown tags is kept, and full toolbar output round-trips unchanged.
- [x] 1.3 `POST /api/articles/cover` with magic-byte type check, 5 MB cap and
      `uploads/articles/`. Verify with curl: JPG, PNG and WebP accepted; a
      renamed text file, an empty file and a 6 MB file get their 400 messages; a
      signed-out caller gets 401 and a User 403.
- [x] 1.4 `POST`, `PUT` and `DELETE /api/articles` with the validation messages,
      draft/publish/unpublish (keeping the first `PublishedAt`), the cover path
      check, and the access rules. Verify with curl as the author, an Admin,
      another Guru (403), a User (403), signed out (401), a former Guru (only an
      Admin may edit), and each 400 message.
- [x] 1.5 `GET /api/articles/{id}`, `POST /api/articles/{id}/view` and
      `GET /api/articles/mine`. Verify with curl: a draft gives 404 to others and
      200 to the author and an Admin; a view counts only on published articles.
- [x] 1.6 `GET /api/articles` browse: search, `category` and `author` facets with
      counts, the five sorts, paging, `lead=1`, and the derived summary. Verify
      with curl against seeded articles: facet counts exclude their own filter,
      page 2 continues without repeats with and without `lead`, and drafts never
      appear.
- [x] 1.7 Add `articleCount` to the category DTO. Verify with curl that deleting a
      category leaves its articles with no category.
- [x] 1.8 Seed a handful of local articles across categories and both Gurus, some
      with covers and some drafts, for browser testing. The data stays in the
      local database.

## 2. Frontend

- [x] 2.1 Install the TipTap v3 packages. Build `components/article/Editor.jsx`
      (toolbar, inline link prompt, placeholder) and `ArticleBody.jsx` with the
      shared typography classes. Verify in the browser that each toolbar button
      produces formatting that survives saving and looks the same in the editor
      and on the page.
- [x] 2.2 Write/edit page at `/articles/tulis` and `/articles/:id/ubah`,
      lazy-loaded: title and summary with counts, rubrik select, cover upload
      with preview and "Hapus sampul", "Simpan draf"/"Terbitkan" and "Simpan
      perubahan"/"Batalkan terbit", server errors, and the unsaved-changes
      prompt on reload. Verify as a Guru and an Admin, and that others are
      redirected.
- [x] 2.3 Article page at `/articles/:id`:
      - breadcrumb, header, author with the tick and ustadz link, meta line,
        cover and body;
      - view counting;
      - for the author and Admins: the draft notice, "Ubah artikel" and "Hapus"
        with a confirm;
      - "Artikel tidak ditemukan.".

      Redirect `/detail-article/:slug`. Verify each state in the browser.
- [x] 2.4 Artikel list at `/articles` per the canvas:
      - search, the Rubrik and Penulis `FacetPanel`s, the results bar with sort
        and the column toggle;
      - active-filter chips, the Sorotan lead, article items, pagination, URL
        state, and both empty states;
      - "Tulis artikel" and "Artikel saya" for a Guru or an Admin.

      Verify in the browser against the canvas, including paging with and
      without the lead.
- [x] 2.5 "Artikel saya" at `/articles/saya` and the links from Profil. Show the
      article count on the Kategori page and include it in the delete prompt.
      Verify in the browser.
- [x] 2.6 Check every new page at a true 400px width, check that all new text is
      Bahasa Indonesia, and run lint and the build.

## 3. Roadmap

- [x] 3.1 On archive, tick change 11 in `openspec/ROADMAP.md`, noting that the
      membership parts are deferred. Verify: `openspec validate articles`.

# Tasks

## 1. Backend

- [x] 1.1 Add `AdminContentController` with `overview`, `questions`, `comments`,
      `articles` and `kajian`, all Admin only. Verify with curl: 401 and 403;
      each status filter and search; paging; the overview counts against SQL;
      and the anonymous asker unmasked.

## 2. Frontend

- [x] 2.1 Add the Ringkasan, Pertanyaan, Komentar and Konten tabs to `AdminNav`,
      point "Panel Admin" at `/admin`, and add the routes under the Admin guard.
- [x] 2.2 Add `AdminList` (search, status chips, paging, all in the URL) and the
      Ringkasan page.
- [x] 2.3 Add the Pertanyaan, Komentar and Konten pages with confirm-then-delete
      through the existing endpoints. Verify in the browser: deleting a question
      notifies its asker, a comment disappears from its question, and an article
      and a kajian are removed.
- [x] 2.4 Check every tab at a true 400px width, check that all text is Bahasa
      Indonesia, and run lint and the build.

## 3. Archive

- [x] 3.1 Sync the specs on archive. Verify: `openspec validate admin-tools`.

## 1. Backend: data

- [x] 1.1 Add the `Category` model (`Id`, `Key` unique, `Name`, `SortOrder`,
      `CreatedAt`) and its `DbSet`; replace `Question.Category` with a nullable
      `CategoryId` and `Category` navigation, configured `ON DELETE SET NULL`.
      Verify: `dotnet build` succeeds.
- [x] 1.2 Add the EF migration: create `Categories`, seed the twelve topics in
      canvas order with the five existing keys unchanged, add `CategoryId`,
      backfill it from the old string, drop the old column; write `Down` to
      restore it. Verify on a scratch copy of the local database: every
      categorised question keeps its category, unknown strings become `NULL`,
      and `Down` restores the column.
- [x] 1.3 Point `QuestionController` at the table: `POST /api/question` resolves
      the posted key (unknown → uncategorised), `?category=` filters by key, and
      list, detail and "mine" responses still return `category` as the key.
      Delete `Models/Categories.cs`. Verify with curl that the responses keep
      their shape and the filter still works.

## 2. Backend: endpoints

- [x] 2.1 `GET /api/categories` — public, ordered, with `questionCount`. Verify
      with curl signed out.
- [x] 2.2 `POST`, `PUT` and `DELETE /api/admin/categories[/{key}]` — Admin only,
      key derivation, 400 "Nama kategori harus diisi", 409 "Kategori dengan nama
      ini sudah ada", 404 for an unknown key, reordering that renumbers 1…n.
      Verify with curl as Admin, as a Guru (403) and signed out (401), including
      that deleting a category leaves its questions with `category: null`.

## 3. Frontend

- [x] 3.1 Turn `lib/category.js` into a cached `useCategories()` hook plus
      `categoryLabel(categories, key)`, and switch every current import to it:
      home topic index, Tanya Jawab and Jawab Pertanyaan filters, Ajukan picker,
      question rows, question detail, "Pertanyaan saya". Verify: all twelve
      topics appear in the filters and picker, and a question without a category
      shows "Lainnya".
- [x] 3.2 Add `AdminNav` ("Pengguna" · "Kategori") to the admin header band and a
      `/admin/categories` page under the Admin guard: list with question counts;
      add; rename inline; "Naik"/"Turun"; delete with a confirmation naming how
      many questions become "Lainnya". Refresh the cached list after each change.
      Verify in the browser as Admin, and that a Guru is sent away from the page.
- [x] 3.3 Check the new page and the switched pages at a true 400px width with no
      horizontal scroll, and that all new text is Bahasa Indonesia.

## 4. Specs and roadmap

- [ ] 4.1 Tick change 2 in `openspec/ROADMAP.md` once archived. Verify:
      `openspec validate categories-as-data` passes.

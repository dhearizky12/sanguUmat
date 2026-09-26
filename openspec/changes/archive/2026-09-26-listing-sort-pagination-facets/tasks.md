## 1. Backend

- [x] 1.1 Extract the featured-answer rule into one shared expression and use it
      for `answeredBy` / `answeredByRole` / `answeredByPicture` in the existing
      list and "mine". Verify with curl that those responses are unchanged.
- [x] 1.2 Add `GET /api/question/browse` with `search`, repeated `category` and
      `ustadz`, `sort`, `page` and `pageSize` (default 8, max 50, clamped page),
      returning the envelope with `readMinutes` on each item. Published questions
      only. Verify with curl: default page, page 2, a page past the end, every
      sort, search, and the `category` × `ustadz` AND/OR combinations.
- [x] 1.3 Add `facets.categories` and `facets.ustadz` with counts that exclude
      their own facet. Verify with curl that selecting a category leaves the
      other category counts unchanged while the ustadz counts narrow, and the
      reverse.

## 2. Frontend

- [x] 2.1 URL-state helpers for search, categories, ustadz, sort and page (any
      change but page resets to 1). Verify: reload and back/forward keep the
      state.
- [x] 2.2 `FacetPanel` — search box, every value as check boxes with counts in
      a list that scrolls past nine rows, "Semua".
      Verify in the browser with the Kategori (12) and Ustadz facets.
- [x] 2.3 `Pagination` — "Halaman X dari Y", "Sebelumnya", numbers,
      "Berikutnya", disabled ends. Verify across first, middle and last pages.
- [x] 2.4 Rebuild `Questions.jsx` on `/api/question/browse`: panel beside the
      results (sticky; stacked at 900px and below), results bar with "N dari M
      jawaban", "Urutkan" and the column toggle, "Saringan aktif" chips with
      "Hapus semua", the empty state with "Atur ulang saringan", and the
      read-time count on each row. Verify every control in the browser against
      the Tanya Jawab canvas.
- [x] 2.5 Check the page at a true 400px width with no horizontal scroll, that
      all new text is Bahasa Indonesia, and that the home page, answer queue and
      question sidebar still work on `GET /api/question`.

## 3. Roadmap

- [x] 3.1 On archive, tick change 3 and note in change 4 that the Ustadz facet
      already exists. Verify: `openspec validate listing-sort-pagination-facets`.

# Tasks

## 1. Backend

- [x] 1.1 `GET /api/home/summary` with `publishedAnswers`, `ustadz` and
      `lastAnsweredAt`, using `QuestionVisibility.Published()`. Verify with
      curl, including that answering a private question changes neither the
      count nor the date.

## 2. Frontend

- [x] 2.1 Hero stats line from the summary, with `wibDateKey()` and "hari ini",
      "kemarin" and "N hari lalu". Verify in the browser and by shifting a test
      answer's date.
- [x] 2.2 Switch Jawaban Terbaru to `browse?pageSize=8` and `QuestionCard`, add
      "Lihat semua jawaban", and delete `QuestionListItem.jsx`. Verify in the
      browser's network log that no per-question requests are made.
- [x] 2.3 Add the live strip, and the Ngaji Bareng section with its featured
      kajian (live, next or none), Rekaman terbaru and the empty case. Verify
      with a live kajian, with only scheduled ones, and with none.
- [x] 2.4 Add Artikel Pilihan with the lead picked by cover, three more, and
      the empty case. Verify in the browser.
- [x] 2.5 Check the page at a true 400px width, check that all new text is
      Bahasa Indonesia, and run lint and the build.

## 3. Roadmap

- [ ] 3.1 On archive, record the home page sections under "Deferred, not yet
      sequenced" as done in `openspec/ROADMAP.md`. Verify:
      `openspec validate home-page-sections`.

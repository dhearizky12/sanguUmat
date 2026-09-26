# Proposal

## Why

The home page (Beranda) was restyled before Artikel and Ngaji Bareng existed.
It shows the hero, the latest answers and a call to action, but none of the
canvas's sections that point to the rest of the site:
- the live strip;
- the Ngaji Bareng section;
- Artikel Pilihan;
- the full stats line.

Both features now have real data, so the home page can show visitors that the
site is more than Q&A. Separately, the home page loads each answered question
one by one to build its list (an N+1 fetch). That gets slower with every
answer published, and the browse endpoint already does the job.

## What Changes

Touches **both backend and frontend**. The backend part is one small read
endpoint.

- **Live strip:** under the hero, while a kajian is live, "Ngaji berlangsung",
  its title and ustadz, and "Gabung sekarang" to its page.
- **Stats line:** the hero's "N jawaban terverifikasi" becomes the canvas's "N
  jawaban terverifikasi / N ustadz / diperbarui {hari ini | kemarin | N hari
  lalu}".
- **"Jawaban Terbaru":**
  - it reads the first page of `GET /api/question/browse`, dropping the
    per-question detail fetches;
  - rows become the same `QuestionCard` as Tanya Jawab, crediting who asked and
    who answered;
  - "Lihat semua jawaban" goes to Tanya Jawab;
  - the existing one/two-column toggle stays.
- **Ngaji Bareng section** (dark band, the canvas's `#ngaji`):
  - the live kajian, or the next scheduled one when nothing is live, with its
    thumbnail and "Gabung kajian" (or its WIB time and "Tambah ke kalender");
  - "Rekaman terbaru", the four newest recordings;
  - "Semua rekaman kajian";
  - the section is hidden when there are no kajian at all.
- **Artikel Pilihan:** the newest article with a cover as the large lead, plus
  the next three published articles, and "Semua artikel". It is hidden when no
  article is published.
- **Left as they are:**
  - "Sering dicari" stays the canvas's fixed suggestions;
  - "Daftar Isi Pembahasan" stays hidden, as asked earlier;
  - membership tags are still absent.

### New endpoint

| Method | Path | Auth | Response |
| --- | --- | --- | --- |
| GET | `/api/home/summary` | none | 200 `{ publishedAnswers, ustadz, lastAnsweredAt }`: the count of published questions, the count of Gurus, and when the newest answer on a published question was posted (null when none). |

The live strip, Ngaji Bareng and Artikel Pilihan reuse the existing
`GET /api/kajian/now`, `GET /api/kajian` and `GET /api/articles` endpoints.

## Capabilities

### New Capabilities

- `home-page`: what Beranda shows. Covers the hero's stats, the live strip, the
  latest answers, the Ngaji Bareng and Artikel Pilihan sections, and the
  summary endpoint.

### Modified Capabilities

None. The endpoints the sections read are unchanged.

## Impact

- **Backend:** a small `HomeController`, reusing `QuestionVisibility.Published()`
  so private answers are never counted.
- **Frontend:**
  - `pages/Dashboard.jsx` and `components/dashboard/HeroSearch.jsx`;
  - `QuestionListSection.jsx`, switched to `QuestionCard`;
  - new `components/dashboard/LiveStrip.jsx`, `NgajiSection.jsx` and
    `ArticleSection.jsx`.
  
  The unused `dashboard/QuestionListItem.jsx` is removed.
- **Out of scope:** an Admin-curated "Artikel Pilihan", editable "Sering
  dicari", search analytics, and live viewer counts.

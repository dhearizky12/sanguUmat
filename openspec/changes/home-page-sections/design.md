# Design

## Context

- **Data loading:** `Dashboard.jsx` lists answered questions with
  `GET /api/question?status=answered`, then fetches every question's detail to
  show its answer as the excerpt. That is one request per published question on
  every home visit.
- **Existing endpoints:** the browse endpoint, `GET /api/kajian/now`,
  `GET /api/kajian` and `GET /api/articles` all exist and are public.
- **Reusable components:** `QuestionCard`, `KajianThumb`, `LiveMark`,
  `ArticleCover`, `calendarLink`, the WIB helpers and `girih-pattern-gold-soft`
  are all available.

## Goals / Non-Goals

**Goals:**
- A fixed, small number of requests per home visit (five), none of them
  per-item.
- Each section appears only when it has something to show, so a new install
  never looks broken.

**Non-Goals:**
- Server-side composition of the whole page into one endpoint.
- Curation of featured content.

## Decisions

### One summary endpoint, everything else reused

`GET /api/home/summary` answers the only question no existing endpoint can:
when the newest published answer was posted. It also counts Gurus and published
questions, so the hero needs one call.

Rejected: deriving "diperbarui" from the browse items. They carry the
question's date, not the answer's. The counts could also come from
`/api/ustadz` and `browse.totalPublished`, but that fetches whole lists to count
them.

### Requests on load

The five requests fire in parallel on mount:
- `summary`;
- `question/browse?pageSize=8`;
- `kajian/now`;
- `kajian?pageSize=4`;
- `articles?pageSize=4`.

Each section renders independently as its data arrives; there is no
page-level spinner. A failed request hides only its own section.

The live strip and the Ngaji section share the one `kajian/now` response. The
home page does not poll (Ngaji Bareng itself refreshes every minute). A visitor
who stays on the home page past the end of a live session sees the strip until
they reload, which is acceptable for a landing page.

### Latest answers use `QuestionCard`

The dashboard's `QuestionListItem` shows the featured answer's text, and that
is exactly what forces the per-question fetches. Switching to `QuestionCard`
(the question's own text, the asker and the answerer, as in Tanya Jawab) makes
the home list and Tanya Jawab identical, and removes the only reason for the
detail fetches. `QuestionListItem.jsx` is deleted.

### Artikel Pilihan's lead

The endpoint's `?lead=1` is built for the Artikel list's Sorotan rule, which
needs more than three articles. So the home page picks the lead from the four
newest itself: the first with a cover, or else the first. The other three
follow in date order. No curation flag is added.

### "diperbarui"

This is computed on the client from `lastAnsweredAt`. Both it and today are
reduced to WIB calendar dates, via a `wibDateKey()` helper in `lib/wib.js`, and
the difference in days picks "hari ini", "kemarin" or "N hari lalu".

## Risks / Trade-offs

- **[Five requests]** They are small, public and parallel, so this is still far
  fewer than today's N+1.
- **[A stale live strip]** see "Requests on load" above. A reload fixes it.
- **[The excerpt changes]** Home rows show the question, not the answer's
  opening lines. This matches Tanya Jawab, which users already know.

## Migration Plan

Nothing to migrate: the change adds no tables, only one read endpoint.

# Proposal

## Why

An ustadz's page lists only their answers, although ustadz now also write
articles and lead kajian. A reader who finds an ustadz they trust has no way
to see the rest of that ustadz's work without going to Artikel or Ngaji Bareng
and filtering by name.

## What Changes

**Frontend only.** The existing list endpoints already filter by author and by
ustadz.

- **Tabs:** the ustadz page's main column becomes three tabs, "Jawaban (N)",
  "Artikel (N)" and "Kajian (N)". Each lists that ustadz's work with its own
  pagination, and the tab is kept in the URL (`?tab=artikel`, `?tab=kajian`).
- **Empty tabs:** a tab with nothing in it is not shown. When only answers
  exist, the page looks exactly as it does today.
- **The Kajian tab:** it opens with the ustadz's sessions in this week's
  schedule (and the live one, if it is theirs), then their recordings.
- **Endpoints used:**
  - `GET /api/question/browse?ustadz={id}` (as today);
  - `GET /api/articles?author={id}`;
  - `GET /api/kajian?ustadz={id}`;
  - `GET /api/kajian/now`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `ustadz-profiles`: the ustadz page shows the ustadz's articles and kajian
  beside their answers.

## Impact

- **Frontend:** `pages/UstadzDetail.jsx`, reusing `ArticleRow` and `KajianRow`.
- **Backend:** none.

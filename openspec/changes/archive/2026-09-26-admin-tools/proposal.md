# Proposal

## Why

Panel Admin can only change roles and edit categories. Everything else an Admin
is responsible for has no view at all:
- how the site is doing;
- which questions have waited longest;
- private and anonymous questions;
- comments that need removing;
- drafts and kajian across every ustadz.

Moderating today means knowing a URL and opening items one by one.

## What Changes

Touches **both backend and frontend**. The backend adds read-only Admin list
endpoints; deleting reuses the existing endpoints, which already allow Admins.

- **Panel Admin gets four new tabs** beside Pengguna and Kategori:
  - **Ringkasan** (`/admin`, now where "Panel Admin" opens): counts of users by
    role, published and waiting questions, private answers, this week's
    answers and comments, articles (published and draft), and kajian
    (scheduled, live, recorded). It also lists the five questions that have
    waited longest, as "Perlu dijawab".
  - **Pertanyaan** (`/admin/pertanyaan`): every question, including waiting,
    private and anonymous ones.
    - Search, a Semua / Menunggu / Terjawab / Privat filter, 20 a page.
    - Each row shows the asker's real name (marked anonim), directed-to, and
      answer and comment counts, with "Buka" and "Hapus".
  - **Komentar** (`/admin/komentar`): the newest comments across the site.
    - Search, 20 a page.
    - Each row shows its author and the question it sits under, with "Buka"
      and "Hapus".
  - **Konten** (`/admin/konten`): articles (Draf / Terbit) and kajian (Jadwal /
    Live / Rekaman) from every ustadz.
    - Search and a status filter, 20 a page.
    - "Buka", "Ubah" and "Hapus" on each row.
- **Deleting asks to confirm first,** and removes the row from the list.
  Deleting someone else's question still notifies its asker, as today.

### New endpoints (all Admin only: 401 signed out, 403 for anyone else)

| Method | Path | Response |
| --- | --- | --- |
| GET | `/api/admin/overview` | 200 `{ users, questions, activity, articles, kajian, waiting }`, as specified. |
| GET | `/api/admin/questions?search=&status=&page=` | 200 `{ items, total, page, totalPages }`. |
| GET | `/api/admin/comments?search=&page=` | 200 `{ items, total, page, totalPages }`. |
| GET | `/api/admin/articles?search=&status=&page=` | 200 `{ items, total, page, totalPages }`, drafts included. |
| GET | `/api/admin/kajian?search=&status=&page=` | 200 `{ items, total, page, totalPages }`. |

## Capabilities

### New Capabilities

- `admin-tools`: the Ringkasan, Pertanyaan, Komentar and Konten tabs and their
  endpoints.

### Modified Capabilities

- `admin-users`: "Panel Admin" now opens on Ringkasan, and the panel's tabs are
  Ringkasan, Pertanyaan, Komentar, Konten, Pengguna and Kategori.

## Impact

- **Backend:** a new `AdminContentController` with read-only queries, reusing
  `KajianClock` and the existing models.
- **Frontend:**
  - `AdminNav` tabs;
  - new pages `AdminOverview`, `AdminQuestions`, `AdminComments` and
    `AdminContent`;
  - the header's "Panel Admin" link goes to `/admin`.
- **Out of scope:**
  - editing other people's questions (still not a moderation action);
  - notifications for moderated answers or comments;
  - bulk actions;
  - audit logs.

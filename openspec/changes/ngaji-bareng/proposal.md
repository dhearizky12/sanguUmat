# Proposal

## Why

Ngaji Bareng is one of the three sections in the main navigation, yet it is
still a "coming soon" placeholder. The kajian themselves already happen on
YouTube, as live streams and uploads. So the site doesn't need to host or
stream anything. It needs to organise those videos:
- what is live now;
- what is on this week;
- a searchable archive of recordings with their catatan ngaji;
- all played inside the site's own pages.

Membership (roadmap 5) is still skipped, so everything is open to everyone. The
canvas's "Jadi Anggota" banner is left out.

## What Changes

Touches **both backend and frontend**.

- **New `Kajian` (session) model:**
  - title, short description, series ("Seri", free text), the leading ustadz;
  - a YouTube video id, parsed from a pasted link (watch, youtu.be, live,
    embed or shorts);
  - start time, duration in minutes, optional catatan ngaji (rich text,
    sanitised like articles), and a "disimak" count.
- **Status comes from the clock**, with nothing to toggle:
  - *Jadwal* before the start;
  - *Live* from the start until start + duration;
  - *Rekaman* after that.
  
  The session number ("Sesi ke-N") is its position in its series by start
  time.
- **Who manages sessions:** a Guru adds and edits sessions they lead; an Admin
  manages any session and may pick any Guru to lead it.
- **Ngaji Bareng page** (`/live`), following the canvas:
  - **Live section:** the session live right now, if any, with "Berjalan N
    menit", its series, "Sesi ke-N", "Gabung kajian" and "Catatan sesi lalu".
    There is no viewer count, since YouTube doesn't give one without an API key.
  - **"Jadwal pekan ini"** in WIB. "Tambah ke kalender" (a Google Calendar
    link) replaces the canvas's "Ingatkan saya", which needs notifications
    (roadmap 7).
  - **"Arsip rekaman":** search; Seri and Ustadz filters with counts; "Ada
    catatan ngaji"; the five sorts; a list/card toggle; active-filter chips;
    and pagination at 8 a page.
- **Session page** (`/live/:id`):
  - the embedded YouTube player (youtube-nocookie) and a "Buka di YouTube"
    link;
  - status, title, the ustadz (linking to their page), series and session
    number, date and time in WIB, duration and description;
  - the catatan ngaji, and the other sessions in the same series.
- **Management pages:**
  - `/live/tambah` and `/live/:id/ubah`: the form, with a live preview of the
    pasted link's thumbnail and the notes editor;
  - `/live/kelola` ("Kelola kajian"): the manager's sessions, grouped by
    status.

### New endpoints

| Method | Path | Auth | Response |
| --- | --- | --- | --- |
| GET | `/api/kajian/now` | none | 200 `{ live, previousWithNotes, schedule }`: the live session or null, the latest earlier session of its series with notes, and sessions starting in the next 7 days, soonest first. |
| GET | `/api/kajian` | none | 200 `{ items, total, totalRecorded, page, pageSize, totalPages, facets: { series, ustadz } }`: ended sessions only, with `search`, `series`, `ustadz`, `notes=1`, `sort`, `page` and `pageSize`. |
| GET | `/api/kajian/{id}` | none | 200 with the session, its `status`, `sessionNumber`, `notes` and `seriesSessions`. 404 when unknown. |
| POST | `/api/kajian/{id}/view` | none | 200 `{ views }`. |
| GET | `/api/kajian/mine` | Guru or Admin | 200: a Guru's own sessions; every session for an Admin. |
| POST | `/api/kajian` | Guru or Admin | 201 with the session. The body is `{ title, description, series, youtube, startsAt, durationMinutes, notes, ustadz? }`. |
| PUT | `/api/kajian/{id}` | the leading Guru (still a Guru) or an Admin | 200 with the session. |
| DELETE | `/api/kajian/{id}` | the leading Guru or an Admin | 204. |

A session item is `{ id, title, description, series, youtubeId, thumbnail,
startsAt, endsAt, durationMinutes, status, sessionNumber, hasNotes, views,
ustadz: { id, name, picture } }`.

## Capabilities

### New Capabilities

- `ngaji-bareng`: scheduling YouTube kajian, their live, schedule and recording
  states, the archive with facets, sort and paging, and the Ngaji Bareng pages.

### Modified Capabilities

None.

## Impact

- **Backend:**
  - `Models/Kajian.cs` and a migration.
  - `KajianController`.
  - A `YouTube` link parser.
  - Reuse of `ArticleHtml` for the notes.
- **Frontend:**
  - Pages: `Live.jsx` gets real content, plus `KajianDetail.jsx`,
    `KajianEdit.jsx` (lazy, reusing the article `Editor`) and
    `KajianManage.jsx`.
  - Components under `components/kajian/`, and routes.
  - A WIB date helper.
- **External:** the site's pages embed YouTube, via youtube-nocookie.com, and
  load thumbnails from `i.ytimg.com`. No API key is needed.
- **Out of scope:**
  - YouTube channel sync;
  - live viewer counts;
  - reminders and notifications (roadmap 7);
  - membership gating;
  - recurring schedules (each session is entered on its own).

# Design

## Context

- **Browsing pattern:** the Artikel browse endpoint and page
  (`ArticlesController.Browse`, `pages/Articles.jsx`) already set the pattern
  this archive follows: a lightweight in-memory index; each facet counted over
  the other filters; the five sort keys; 8 a page; URL state; `FacetPanel`,
  `Pagination` and the one/two-column toggle.
- **Reuse from articles:** `ArticleHtml.Clean` sanitises rich text, and the
  TipTap `Editor` component is lazy-loaded behind the write pages.
- **Access rules:** the Guru/Admin rules match articles (`CanWrite`,
  `CanManage`).
- **Time:** times are stored in UTC (`timestamp with time zone`, via Npgsql).
  The audience is Indonesian, and the canvas shows WIB.

## Goals / Non-Goals

**Goals:**
- No YouTube API key and no background jobs. Everything derives from what a
  manager pastes and the current time.
- The archive feels like Artikel: the same components, the same URL behaviour.

**Non-Goals:**
- Channel sync, viewer counts, reminders, recurring schedules and membership.

## Decisions

### Model: one `Kajian` table

| Column | Notes |
| --- | --- |
| `Id` | |
| `Title` (160) | |
| `Description` (1000, nullable) | |
| `Series` (60) | Free text. |
| `UstadzId` | Foreign key to `Users`, CASCADE like articles. |
| `YoutubeId` (11) | |
| `StartsAt` (UTC) | |
| `DurationMinutes` | |
| `Notes` (sanitised HTML) | |
| `NotesText` | The notes as text, for search and `hasNotes`. |
| `Views` | |
| `CreatedAt`, `UpdatedAt` | |

Indexes: `StartsAt`, `UstadzId` and `Series`.

- **Series is free text,** not a managed table. The canvas's series (Tafsir,
  Hadis, Fikih…) are a handful, and a manager's datalist of existing names keeps
  spelling consistent. A table would add an Admin page for little gain.
  Grouping ignores case (`lower(Series)`).
- **Status is never stored.** It is computed from `StartsAt`,
  `DurationMinutes` and `DateTime.UtcNow` in one helper
  (`KajianClock.StatusOf`), so a session can never be stuck on "live".
- **Filtering by status in SQL:**
  - "Recorded" is `k.StartsAt.AddMinutes(k.DurationMinutes) <= now`, a per-row
    interval that Npgsql translates to SQL.
  - "Live" is `StartsAt <= now && StartsAt + duration > now`.

### Session number

`sessionNumber` is 1 + the count of the series' kajian with an earlier
`StartsAt`, or the same `StartsAt` and a lower id.
- For lists, it is computed in memory from a per-series ordered list of
  (Id, StartsAt), loaded once per request for the series on the page.
- For detail, `seriesSessions` gives it directly.

### YouTube parsing

`YouTubeLink.TryParseId(string)` uses a regex over the URL forms in the spec
and validates the id against `^[A-Za-z0-9_-]{11}$`. Rejected: calling YouTube
oEmbed to verify the video exists. That is a network call on save, and
unlisted or scheduled streams can fail it.

### Embedding

The player is
`https://www.youtube-nocookie.com/embed/{id}?rel=0&modestbranding=1` in an
`iframe` with `allow="accelerometer; autoplay; clipboard-write;
encrypted-media; gyroscope; picture-in-picture; web-share"`,
`allowFullScreen`, `referrerPolicy="strict-origin-when-cross-origin"` and
`loading="lazy"`.
- A live stream's normal video id plays live in the embed, then plays as a
  recording once the stream ends. The same id serves both states, which is why
  a pasted link is enough.
- "Buka di YouTube" goes to `https://www.youtube.com/watch?v={id}`.
- Thumbnails come from `i.ytimg.com/vi/{id}/hqdefault.jpg`. It exists for
  every video, including scheduled streams.

### Time zone

The frontend's `lib/wib.js` formats with `Intl.DateTimeFormat("id-ID",
{ timeZone: "Asia/Jakarta" })`, for the day name, date and time "19.30". The
form's `<input type="datetime-local">` is read as WIB: WIB is UTC+7 all year
with no daylight saving, so the conversion is fixed. `toWibInput(iso)` and
`fromWibInput(value)` convert without depending on the browser's zone.
Rejected: storing local time, which would break for any non-WIB server.

### "Tambah ke kalender"

This is a Google Calendar template link:
`https://calendar.google.com/calendar/render?action=TEMPLATE&text=…&dates=YYYYMMDDTHHMMSSZ/…&details=…`,
with the session page's URL in the details. It needs no account integration
and works on phones. It stands in for the canvas's "Ingatkan saya" until
notifications exist.

### API shape

Two public read endpoints:
- `now`: live, the previous session with notes, and the week's schedule.
- the archive browse.

They are separate because the page renders them as separate sections, and the
archive changes with filters while `now` doesn't. The page refetches `now` once
a minute, so live and schedule states roll over without a reload.

### Frontend structure

- `components/kajian/`:
  - `KajianThumb`: the thumbnail with a duration badge and an optional Live
    mark;
  - `KajianRow`: list and card views;
  - `LiveBand`;
  - `ScheduleList`;
  - `YouTubePlayer`.
- `lib/kajianParams.js` holds the URL state (search, series, ustadz, notes,
  sort, page), mirroring `articleParams`.
- Routes: `/live/tambah`, `/live/kelola` and `/live/:id/ubah` sit under the same
  guards as articles, with `RoleGuard allow={["Guru","Admin"]}
  fallback="/live"`. `KajianEdit` is lazy-loaded, since it pulls in TipTap.

## Risks / Trade-offs

- **[A wrong duration makes "live" wrong]** A stream that overruns shows as a
  recording early (the embed still plays live). → Managers can edit the
  duration, and the form suggests typical lengths.
- **[Deleted or private YouTube videos]** show YouTube's own "video unavailable"
  in the embed. → Acceptable; "Buka di YouTube" makes it obvious, and a manager
  can fix or delete the session.
- **[In-memory facet counting]** is fine for hundreds or low thousands of
  sessions, as for articles.
- **[Third-party embed]** YouTube sets cookies once playing, even on the
  nocookie domain. → Nocookie avoids them until play, the best available
  without self-hosting.

## Migration Plan

- An additive migration creates `Kajian`.
- Rollback: migrate back to `QuestionExtras`.
- No backfill.

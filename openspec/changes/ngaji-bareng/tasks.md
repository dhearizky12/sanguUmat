# Tasks

## 1. Backend

- [x] 1.1 Add the `Kajian` model (with `NotesText`), its `DbSet`, foreign key and
      indexes, and the migration. Verify on a scratch copy of the local
      database: it applies and rolls back to `QuestionExtras`.
- [x] 1.2 Add `YouTubeLink.TryParseId` and `KajianClock` (status, ends-at).
      Verify with curl through 1.3: every URL form in the spec is accepted, and
      junk and a wrong-length id are refused.
- [x] 1.3 `POST`, `PUT` and `DELETE /api/kajian` with the validation messages and
      access rules (a Guru leads their own; an Admin picks the Guru). Verify
      with curl as the Guru, another Guru (403), a User (403), signed out (401),
      a former Guru (403), and an Admin with and without a valid `ustadz`.
- [x] 1.4 `GET /api/kajian/{id}`, `POST /{id}/view`, `GET /mine` and
      `GET /now`. Verify with curl against kajian placed in the past, now and
      the next week: status, session numbers, `previousWithNotes` and the
      schedule window.
- [x] 1.5 `GET /api/kajian` archive: recorded only, search, series, ustadz and
      notes facets with counts, the five sorts, and paging. Verify with curl.
- [x] 1.6 Seed local kajian across series and both Gurus: one live now, a few
      this week, and a dozen recordings with real public YouTube ids, some with
      notes. The data stays in the local database.

## 2. Frontend

- [x] 2.1 Add the WIB helpers (`lib/wib.js`), the Google Calendar link, the
      `YouTubePlayer` and the `KajianThumb`, `KajianRow`, `LiveBand` and
      `ScheduleList` components.
- [x] 2.2 Ngaji Bareng at `/live`: the live band, "Jadwal pekan ini", and "Arsip
      rekaman" with facets, sort, toggle, chips, pagination, URL state, empty
      states, and "Tambah kajian" / "Kelola kajian" for managers; refresh
      `now` every minute. Verify in the browser against the canvas.
- [x] 2.3 Kajian page at `/live/:id`: the player, meta, description, notes, the
      series list, view counting, "Tambah ke kalender" when scheduled,
      edit/delete for managers, and not-found. Verify each state.
- [x] 2.4 Add/edit pages (lazy) with the thumbnail preview, series suggestions,
      WIB date and time, the notes editor, and the Admin-only ustadz picker;
      and "Kelola kajian" grouped by status. Verify as a Guru and an Admin, and
      that others are redirected.
- [x] 2.5 Check every new page at a true 400px width, check that all new text is
      Bahasa Indonesia, and run lint and the build.

## 3. Roadmap

- [ ] 3.1 On archive, tick change 12 in `openspec/ROADMAP.md`. Verify:
      `openspec validate ngaji-bareng`.

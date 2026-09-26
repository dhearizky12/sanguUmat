## 1. Backend

- [x] 1.1 Add `UstadzProfile`, `UstadzExpertise` and `UstadzEducation` models,
      their `DbSet`s and keys, and the migration. Verify on a scratch copy of the
      local database: the migration applies and rolls back.
- [x] 1.2 `GET /api/ustadz` and `GET /api/ustadz/{id}` (Guru only, empty profile
      when no row, `answerCount` on published questions). Verify with curl,
      including a non-Guru id (404).
- [x] 1.3 `PUT /api/ustadz/{id}` with the validation messages and access rules.
      Verify with curl as the ustadz, as an Admin, as another Guru (403), signed
      out (401), for a non-Guru (404), and each 400 message; that unknown
      expertise keys are ignored; and that deleting a category removes it from
      expertise.

## 2. Frontend

- [x] 2.1 Dewan Ustadz page at `/ustadz`, and the footer link. Verify in the
      browser.
- [x] 2.2 Ustadz page at `/ustadz/:id`: profile with missing parts omitted,
      "Jawaban dari {name}" with pagination via browse, "Ubah profil ustadz" for
      the ustadz and Admins, "Ustadz tidak ditemukan." for a non-Guru. Verify in
      the browser.
- [x] 2.3 Edit page at `/ustadz/:id/ubah`: title, bio with a character count,
      expertise check boxes from the categories, education rows to add, remove
      and reorder; Bahasa errors from the server. Redirect others to the ustadz
      page. Link from a Guru's Profil page and the Guru rows in Panel Admin.
      Verify as the ustadz, as an Admin, and as another user.
- [x] 2.4 Link answer authors on the question page to their ustadz page; remove
      `DetailAdmin` and redirect `/detail-admin/:id`. Verify both.
- [x] 2.5 Check the new pages at a true 400px width and that all new text is
      Bahasa Indonesia.

## 3. Roadmap

- [x] 3.1 Tick change 4 in `openspec/ROADMAP.md` on archive. Verify:
      `openspec validate ustadz-profiles`.

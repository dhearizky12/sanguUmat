# Tasks

## 1. Backend

- [x] 1.1 Add `IsAnonymous`, `AllowPublish` (default true) and `DirectedToId`
      (foreign key to `Users`, SET NULL) to `Question`, plus the migration.
      Verify on a scratch copy of the local database: existing rows read as
      consented and not anonymous, and the migration rolls back to `Articles`.
- [x] 1.2 Add `QuestionVisibility` (`Published()`, `CanSee`) and switch every
      "public" `Answers.Any()` in `QuestionController` and `UstadzController`
      to it. Verify with curl that a private answer is absent from
      `GET /api/question`, `/browse` (items, facets, `totalPublished`), detail
      and view as a stranger (404) and `/api/ustadz` counts, and present for the
      asker, a Guru and an Admin.
- [x] 1.3 `POST` and `PUT /api/question` take the new fields, with the Guru check
      and its 400 message, and omitted fields on PUT keep their values. The
      pending queue puts questions directed to the caller first. Verify with
      curl.
- [x] 1.4 Masking with `QuestionMask` on lists, browse and detail, and in
      `GetComments`; `GetComments` and `CreateComment` return 404 for a private
      answer the caller may not see. Verify with curl as a stranger, the asker,
      a Guru and an Admin.

## 2. Frontend

- [x] 2.1 Ajukan Pertanyaan: add "Ditujukan kepada", the two check boxes and the
      `?ustadz=` preset; add "Tanya ustadz ini" on the ustadz page. Verify in
      the browser that a sent question carries all three.
- [x] 2.2 Add `QuestionFlags` and show it in Pertanyaan saya, the answer queue
      (directed-to-me first, "Ditujukan kepada Anda") and the question header,
      with "Privat — tidak ditayangkan di Tanya Jawab" and "Ditujukan kepada
      {name}" linking to the ustadz's page. Verify in the browser.
- [x] 2.3 Anonymous display: show "Hamba Allah" in question rows, dashboard
      items, the question header and comments for the public, and the real name
      with "anonim" for staff. Verify signed out and as a Guru.
- [x] 2.4 Add the two check boxes to the question edit form. Verify that editing
      an unanswered question changes them.
- [x] 2.5 Check the changed pages at a true 400px width, check that all new text
      is Bahasa Indonesia, and run lint and the build.

## 3. Roadmap

- [ ] 3.1 On archive, tick change 10 in `openspec/ROADMAP.md`. Verify:
      `openspec validate question-extras`.

# Tasks

## 1. Backend

- [x] 1.1 `User.HideAsUstadz` (migration, default false) and the shared rule: `Roles.CanAnswer`, an EF-translatable `IsUstadz` expression and an in-memory form. Verify: `dotnet build` passes and the migration applies; existing users are all not hidden.
- [x] 1.2 Answers and the queue for Admins: `POST /api/answer` accepts an `Admin`, a `User` still gets 403, and the featured-answer ordering counts an Admin answer like a Guru's. Verify with test tokens: an Admin (hidden and not) answers, a User gets 403, and the question list shows the Admin as `answeredBy`.
- [x] 1.3 Ustadz endpoints, directed-to, notifications and counts use the shared rule: `GET /api/ustadz` and `/{id}` and `PUT /{id}`, the directed-to check, `Notifier` recipients, the ustadz facet and the home count. Verify: a visible Admin is listed, has a page, can be directed to and gets the new-question notification; a hidden Admin does none of these and `/api/ustadz/{id}` is 404 for them; a Guru is unchanged.
- [x] 1.4 Posts, kajian and `isUstadz` flags: an Admin posting with no `ustadzId` credits themselves when visible and gets 400 when hidden, a named non-ustadz gets 400; a kajian's ustadz must pass the rule; `isUstadz` on `/api/auth/me`, answers, list items and article authors. Verify with test tokens for a Guru, a visible Admin and a hidden Admin.
- [x] 1.5 `PATCH /api/admin/users/{id}/ustadz` and `hiddenAsUstadz` in `GET /api/admin/users`. Verify: an Admin hides and shows an Admin (themselves too), a non-Admin target gets 400, an unknown id 404, a User caller 403, and the hidden Admin disappears from `/api/ustadz` and returns when shown.

## 2. Frontend

- [ ] 2.1 `lib/roles.js` (`canAnswer`, `isUstadz`) and the answering side: the `/jawab-pertanyaan` route, the header's "Jawab Pertanyaan" button and count, the answer form, the related sidebar. Verify in a browser as an Admin: the queue, the count and "Tulis jawaban" appear, and a User sees none of them.
- [ ] 2.2 The ustadz side: `AnswerItem`, `QuestionCard`, `ArticleByline`, Profil's "Profil ustadz" and the ustadz link on Panel Admin use `isUstadz`. Verify in a browser: a visible Admin's answers show the tick and link to their page, a hidden Admin's show the plain name.
- [ ] 2.3 Panel Admin's Pengguna page: "Tampil di daftar ustadz" / "Disembunyikan dari daftar ustadz" with "Sembunyikan" / "Tampilkan" on each Admin row, and `PostForm` preselects a visible Admin. Verify in a browser: hide and show an Admin and see Dewan Ustadz and the "Ditujukan kepada" choice follow it.

## 3. Wrap-up

- [ ] 3.1 Deploy: pull and restart the API, upload the UI, hide the owner's own Admin account. Verify on the live site: the owner is not in Dewan Ustadz, a second Admin who is shown is, and answers by an Admin read correctly.
- [ ] 3.2 Sync the deltas into `openspec/specs/` and archive the change. Verify: `openspec validate --specs` passes.

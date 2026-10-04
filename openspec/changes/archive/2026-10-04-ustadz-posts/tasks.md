# Tasks

## 1. Backend

- [x] 1.1 Add `Question.IsPost` (bool, default false) and an EF migration. Verify: `dotnet build` passes and a fresh database applies the migration with all existing rows `IsPost = false`.
- [x] 1.2 `POST /api/question/post` and `PUT /api/question/post/{id}` in `QuestionControllers.cs`, writing the question and its answer in one transaction, with the Guru/Admin rules, the `ustadzId` rules, the Bahasa Indonesia validation messages, and no `Notifier` call. Verify with the public API and test tokens: a Guru posts (201), an Admin posts for a Guru, an Admin without `ustadzId` gets 400 "Pilih ustadz yang bersangkutan", a Guru with another `ustadzId` gets 403, a User gets 403 and an anonymous caller 401, empty text gets 400, editing changes both texts, an Admin can re-credit, and an ordinary question id gets 404.
- [x] 1.3 `isPost` on list items and the detail response; leave posts out of `/api/question/mine`; allow the credited ustadz to `DELETE /api/question/{id}` for their post. Verify: a post shows `isPost: true` in `/browse`, `/{id}` and the facets; it is absent from `/mine`; the ustadz can delete it and its answer and comments go too; another Guru gets 403.
- [x] 1.4 `POST /api/answer/{questionId}` returns 409 "Posting ini sudah berisi jawaban" for a post, and `Notifier` stays silent for posts (`AnswerEdited`, `QuestionDeletedByAdmin`). Verify: answering a post gets 409; publishing, editing, an Admin editing the answer, an Admin deleting the post and a comment each leave the credited ustadz with at most the one comment notification and nobody else notified.

- [x] 1.5 Rich answers: `Answer.IsHtml` (migration), `isHtml` on `POST` and `PUT /api/answer`, cleaning through `ArticleHtml.Clean`, 400 "Jawaban tidak boleh kosong" for an empty answer in either format, `isHtml` on each answer in the question detail, and post answers always stored as HTML. Verify with test tokens: a formatted answer keeps its allowed tags and loses a script, a plain one is untouched, empty and empty-markup answers get 400, edits work in both formats, and existing answers read as `isHtml: false`.

## 2. Frontend

- [x] 2.1 Credit lines: `QuestionRow`, `QuestionHeader` and `AnswerItem` show "Diposting oleh {nama}" once for a post (linking to the ustadz) and neither "Ditanyakan" nor "Dijawab". Verify in a browser: a post card and its page read correctly, an ordinary question is unchanged, and lint and the build pass.
- [x] 2.2 `PostForm` page for `/posting/baru` and `/posting/{id}/ubah` (Guru and Admin only): "Pertanyaan", "Jawaban", "Kategori", the Admin's required "Diposting atas nama", "Terbitkan" and its edit mode, plus "Tulis Posting" in the header's ustadz menu and "Ubah" and "Hapus" on a post's page for the credited ustadz and Admin. Verify in a browser: a Guru and an Admin can publish and edit, a User is turned away, and the post appears in Tanya Jawab and under the ustadz.

- [x] 2.3 Rich answer editing: a lazily loaded article editor for "Tulis jawaban", "Ubah jawaban" and the posting page's "Jawaban", plain answers converted to paragraphs when edited, and formatted answers shown in the article type. Verify in a browser: write, edit and read a formatted answer, open a plain answer for editing, and check the question page for a visitor does not load the editor.
- [x] 2.4 "Tulis posting" on the Profil page and on an ustadz's page, with `?ustadz=` preselecting the ustadz for an Admin. Verify in a browser as a Guru and as an Admin.

## 3. Wrap-up

- [x] 3.1 Deploy: pull and restart the API on the laptop, rebuild the UI and upload it. Verify: publish a post on the live site, see it in Tanya Jawab with "Diposting oleh", delete it, and confirm the dummy data is gone afterwards.
- [x] 3.2 Sync the `ustadz-posts`, `answers` and `questions` deltas into `openspec/specs/` and archive the change. Verify: `openspec validate --specs` passes.

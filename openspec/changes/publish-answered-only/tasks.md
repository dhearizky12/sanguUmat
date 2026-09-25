## 1. Backend

- [x] 1.1 Add the visibility rule (answered, or the caller is the asker, a Guru
      or an Admin) and apply it in `GetQuestion` and `RecordView` as a 404.
      Verify with curl: an unanswered question is 404 signed out and for another
      user, 200 for its asker, a Guru and an Admin; `RecordView` leaves `Views`
      unchanged on a 404.
- [x] 1.2 Make `GetQuestions` return answered questions only; allow
      `status=pending` for Guru and Admin, 403 otherwise; treat
      `status=answered` as the default. Verify with curl: the signed-out list has
      no unanswered question, a Guru's `?status=pending` lists them, a user's
      gets 403, and `search` and `category` still combine.

## 2. Frontend

- [x] 2.1 Remove the status filter from Tanya Jawab and the answered/waiting tag
      from `QuestionCard`, and re-lay the question row (shared with the home
      page): category top left, date top right; byline bottom left, view count
      and comment count bottom right ("16 dibaca · 3 komentar"). Verify in the
      browser: only answered questions appear, the "Status" row is gone, and
      rows on Tanya Jawab and home follow the new layout at 1280px and 400px.
- [x] 2.2 Point the Guru's "Jawab pertanyaan lain" sidebar at `?status=pending`.
      Verify as a Guru on a question page: the sidebar lists unanswered
      questions.
- [x] 2.3 Show "Pertanyaan tidak ditemukan" on the question page for any
      non-OK response, with a link to Tanya Jawab, and skip the view call.
      Verify: a signed-out visitor opening an unanswered question sees it; the
      asker, a Guru and an Admin see the question.
- [x] 2.4 Check the answer queue and "Pertanyaan saya" still list pending
      questions, and the changed pages fit a true 400px width.
- [x] 2.5 Add `answeredBy`, `answeredByRole` and `answeredByPicture` to the list
      (and "mine") response. Re-lay the question row on Tanya Jawab and the home
      page: date, views and comments (as icons) at top right; at the bottom,
      pinned level across a grid row, the asker (avatar, "Ditanyakan" over the
      name) on the left and the answerer ("Dijawab" over the name, avatar with a
      small gold tick for a Guru) on the right. Verify with curl that answered questions carry the
      answerer and unanswered ones `null`, and in the browser at 1280px and 400px.

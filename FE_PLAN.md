# Sangu Umat — Frontend Plan

Owned by the frontend developer (this session's focus). See `PLAN.md` for the API contract —
everything below in "Ready now" only depends on endpoints already implemented there.
Everything in "Blocked" is intentionally not started until `BE_PLAN.md` marks the endpoint done.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done

## Ready now (this session)

- [ ] **Fix the admin delete-answer permission bug.** `DetailQuestion.jsx:166` only shows the
  delete button when `me?.id === item.userId && (me?.role === "Admin" || me?.role === "Guru")`
  — an Admin never sees the delete option on someone else's answer, even though
  `AnswerController.DeleteAnswer` already permits it server-side. Change the condition to
  `me?.id === item.userId || me?.role === "Admin"`.
- [ ] **Wire up the Admin nav flag.** `Header.jsx:11` hardcodes `isAdmin = false`. Change to
  `me?.role === "Admin"` (role is already returned by `GET /api/auth/me`). Note: don't link it
  to a real `/admin` page yet — the admin user-management page itself is **blocked** (see
  below) until `BE_PLAN.md`'s admin endpoints exist. For now this just makes the flag correct;
  either hide the nav item until the page exists, or point it at a simple "Segera hadir" state.
- [ ] **Build out `Questions.jsx`.** Currently an empty `<Header/><Footer/>` shell. Implement
  the full question list + search using the existing `GET /api/question?search=` endpoint
  (same data shape `Dashboard.jsx` already consumes) and the existing `QuestionCard` component.
  No answered/pending filter yet — that needs the backend's `isAnswered`/`status` work.
- [ ] **Build the "Pertanyaan Saya" panel in `CreateQuestion.jsx` for real.** Currently fully
  mocked static markup (CreateQuestion.jsx:110-208). Fetch `GET /api/question?search=` and
  filter client-side to `question.userId === me.id` as a stopgap (the endpoint has no per-user
  filter yet). **Mark this filter clearly as temporary** — swap to `GET /api/question/mine`
  once `BE_PLAN.md` ships it, don't build more on top of the client-filter approach.
- [~] **Centralize the API base URL.** Added `src/lib/api.js` exporting `API_URL` (reads
  `VITE_API_URL`, falls back to `http://localhost:5236`) and switched `Dashboard.jsx` over to
  it. Still hardcoded in `AuthProvider.jsx`, `Header.jsx`, `DetailQuestion.jsx`,
  `CreateQuestion.jsx`, `EditProfile.jsx` — migrate the rest opportunistically when touching
  those files.
- [x] **Bahasa Indonesia audit.** Done — translated all known English leftovers across
  `Dashboard.jsx`, `Header.jsx`, `Footer.jsx`, `Login.jsx`, `Loading.jsx`, `Profile.jsx`,
  `CreateQuestion.jsx`, `EditProfile.jsx`, `ArticleCard.jsx`/`ArticleMemberCard.jsx`, plus alt
  text. `data-alt` attributes were left alone (inert leftover metadata from the original AI
  mockups — not real accessible/rendered text).
- [x] **Enriched Dashboard (2026-07-18).** Replaced the old "Pertanyaan Terbaru" + "Featured
  Articles" layout with: "Terbaru Terjawab" (latest answered), "Kumpulan Jawaban Penting"
  (verified-answer collection with a category radio filter), "Paling Banyak Dibaca" (most
  read), and an Articles section reworked to handle missing images. The live search bar still
  works as before — typing now shows a "Hasil Pencarian" section using the existing real
  search endpoint instead of the removed default feed. Details on the workarounds used for data
  the backend doesn't provide (all documented in code comments in `Dashboard.jsx` too):
  - **Latest Answered / Important Answers** use real data: fetches the 10 most recent questions,
    then calls `GET /api/question/{id}` on each to find which have answers (N+1 — acceptable at
    today's question volume, not something to scale further; see `BE_PLAN.md` Phase 4 for the
    real fix). "Important" = an answer with `role === "Guru"`, which needed no new backend
    field.
  - **Category filter** operates on real questions but a fake category — `matchCategory()` in
    `Dashboard.jsx` keyword-matches title/content against a hardcoded Indonesian keyword list
    (sholat/puasa/zakat/keluarga/muamalah). Replace entirely once `BE_PLAN.md`'s `Category`
    field ships — do not build more filtering logic on top of this heuristic.
  - **Most Read** is 100% static placeholder data (`MOST_READ_PLACEHOLDER`) — there is no view-
    count signal anywhere yet. Swap this array out once `BE_PLAN.md` ships view tracking.
  - `ArticleCard`/`ArticleMemberCard` now accept `title`/`category`/`excerpt`/`image` props
    (previously fully hardcoded) and render a decorative fallback panel instead of an `<img>`
    when `image` is omitted — Articles are still otherwise fully mocked, no backend model
    exists for them (out of scope per the team's scope decision).

## Blocked — waiting on `BE_PLAN.md`

- [ ] Admin user-management page (real `DetailAdmin.jsx` build-out + a `RoleGuard` component
  alongside `AuthGuard.jsx`) — needs `GET/PATCH /api/admin/users`.
- [ ] Answered/pending filter + Guru "needs your answer" queue in `Questions.jsx` — needs
  `isAnswered`/`?status=` on `GET /api/question`.
- [ ] Edit-answer UI in `DetailQuestion.jsx` — needs `PUT /api/answer/{id}`.
- [ ] Delete-question UI — needs `DELETE /api/question/{id}`.
- [ ] Swap "Pertanyaan Saya" from client-side filter to `GET /api/question/mine`.
- [ ] Replace `Dashboard.jsx`'s `matchCategory()` keyword heuristic with a real `?category=`
  filter once `BE_PLAN.md`'s `Category` field ships.
- [ ] Replace `Dashboard.jsx`'s N+1 "fetch 10 questions then detail-fetch each" with a proper
  `isAnswered`/`?status=` query once `BE_PLAN.md` ships it.
- [ ] Replace `Dashboard.jsx`'s `MOST_READ_PLACEHOLDER` static data with a real view-count-based
  query once `BE_PLAN.md` ships view tracking.

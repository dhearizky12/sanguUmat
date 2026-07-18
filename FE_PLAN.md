# Sangu Umat — Frontend Plan

Owned by the frontend developer (this session's focus). See `PLAN.md` for the API contract —
everything below in "Ready now" only depends on endpoints already implemented there.
Everything in "Blocked" is intentionally not started until `BE_PLAN.md` marks the endpoint done.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done

## Ready now (this session)

- [x] **Moved detail/create question under `/question/*` + fixed nav active-state (2026-07-19).**
  `/detail-question/:id` → `/question/detail/:id`, `/create-question` → `/question/create`
  (`App.jsx`, and every link pointing at them: `Header.jsx`, `Dashboard.jsx`, `Questions.jsx`,
  `QuestionCard.jsx`). Also fixed a real pre-existing bug this surfaced: `Header.jsx`'s active-
  menu check did an *exact* `location.pathname === path` comparison against a hardcoded list —
  which could never match a dynamic route like `/detail-question/7` (extra `/7` segment) even
  before this change, so "Tanya Jawab" never actually highlighted on the detail or create
  pages. Replaced with `isMenuActive()` (exact match OR `startsWith(path + "/")`), switched to
  React Router's `useLocation()` instead of reading the global `window.location` directly (the
  latter isn't reactive to client-side navigation), and set "Tanya Jawab"'s `matchPaths` to
  `["/questions", "/question"]` — covers the listing page and everything nested under
  `/question/...` in one go. Along the way also fixed the "Artikel" menu's matchPaths, which
  had a typo (`/details-article` instead of the real `/detail-article`) and referenced a
  `/create-article` route that doesn't exist — harmless since Articles are out of scope, but
  cheap to correct while touching the same logic. Also fixed a dangling reference to a
  `classNav` variable removed during this edit (used by the still-hardcoded-off admin "Scholars"
  link) that would have thrown once that flag is ever wired up.

- [x] **Redesigned `DetailQuestion.jsx` + mock comments (2026-07-19).** Was inconsistent with
  the rest of the app: raw `bg-white`/Tailwind defaults instead of the design-system color
  tokens (`surface-container-lowest`, `outline-variant`, etc.) and font scale (`font-headline-lg`
  etc.) used everywhere else, a one-off `max-w-4xl` container instead of the standard
  `max-w-container-max`/`px-gutter`, and — the specific complaint — the question and every
  answer were styled as identical cards, giving no visual hierarchy between "the thing being
  asked" and "the list of responses to it." Now: the question renders as an unboxed page
  header (category pill, title, asker, body) with a bottom border, and answers are a list of
  distinct cards below it, both using the shared design tokens. Delete button also switched
  from raw Tailwind red to the design system's `error`/`error-container` tokens (already
  defined in `index.css`, just unused here before).
  - **Follow-up fix:** first pass still added an inner `max-w-3xl` around the content (for
    reading line-length) sitting inside the outer `max-w-container-max` — that's what was
    still making it look narrower than Beranda. Removed; content now spans the same width as
    every other page, no secondary constraint.
  - **Follow-up fix:** comments were originally rendered inside the same bordered/shadowed box
    as the answer. Moved out — the answer (authoritative scholar content) stays in its clean
    card, comments (lighter community layer) render as a separate unboxed block directly below
    it, associated by proximity/indentation rather than being boxed together.
  - Added mock, per-answer comments (`src/components/CommentSection.jsx`) — seed comments +
    a working input that appends to local state (not persisted, resets on reload; gated behind
    login like the rest of the app). No backend Comment model exists yet — see `BE_PLAN.md`
    Phase 5 for what real implementation needs.

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
- [x] **Render real long-form answers correctly on `DetailQuestion.jsx` (2026-07-19).** Real
  Q&A content from the actual Sangu Umat WhatsApp group is WhatsApp-style formatted text — an
  all-caps title, section labels (PERTANYAAN/JAWABAN/PENJELASAN/REFERENSI/KESIMPULAN), numbered
  points, blank-line paragraph breaks, Arabic reference citations — all inside a single plain
  `Content` string (no structured fields on the backend, see `BE_PLAN.md`). The old
  `<p>{content}</p>` collapsed all of that into one run-on paragraph since CSS ignores
  newlines by default. Added `src/components/RichContent.jsx`: splits on `\n`, renders each
  line as its own block, and lightly bolds lines that look like section headings (known labels,
  or short all-caps lines) and adds spacing before numbered points (`1.`/Arabic-Indic `١.`).
  Verified the heuristic against the user's real pasted example via a standalone Node script
  before wiring it in — caught and fixed a real bug where Arabic-only lines trivially passed
  the "all uppercase" check (Arabic has no letter casing, so `.toUpperCase()` is a no-op),
  which was misclassifying short Arabic reference lines as headings. Wired into both the
  question body and every answer body in `DetailQuestion.jsx`.
  - Added two real examples (verbatim, from the user) to `backend/seed-dummy-data.sql` and ran
    them against the local DB: the Muharram/Suro wedding question (left unanswered — no answer
    was provided, and fabricating a religious ruling isn't something to do), and the full
    suami/istri long-form answer (attributed to the seeded "Ustadzah Hana Wulandari" account).
  - **Rewrote all 10 of the original dummy answers (2026-07-19)** to match this same realistic
    WhatsApp-style format (title/PERTANYAAN/JAWABAN/PENJELASAN numbered points/REFERENSI/
    KESIMPULAN) instead of the short single-paragraph placeholders from the first seed pass —
    they didn't reflect what real answers actually look like. 7 of 10 quote real, short,
    well-known Qur'an verses with accurate surah:ayat citations (Al-Baqarah 183, At-Taubah 103,
    Ar-Rum 21, Al-Baqarah 275); the other 3 use generic, unattributed Arabic fiqh commentary
    rather than a fabricated specific book+page citation, since this is illustrative mock data
    and inventing a fake citation to a real named book would be worse than not citing one.
    Updated both the live local DB (`UPDATE`, matched by question title) and the committed
    `backend/seed-dummy-data.sql` so a fresh setup gets the same content.
  - **Follow-up (2026-07-19): dropped the title/PERTANYAAN preamble from all 11 answers.** The
    detail page already shows the question separately at the top, so every answer restating it
    again (all-caps title + "PERTANYAAN\n<question text>") was pure duplication. Stripped via
    `UPDATE "Answers" SET "Content" = substring("Content" from position('JAWABAN' in "Content"))`
    on the live DB (safer than retyping — no risk of a transcription slip in the Arabic), then
    mirrored the exact same resulting text back into `backend/seed-dummy-data.sql`. Every
    answer now starts directly at JAWABAN.
- [x] **Build out `Questions.jsx` — the real "Tanya Jawab" hub (2026-07-19).** Was an empty
  `<Header/><Footer/>` shell. Now: search box + category filter (chips, same `CATEGORIES` list
  as Dashboard, extracted to `src/lib/category.js` so both pages share it instead of
  duplicating), result count, and a responsive `QuestionCard` grid, with `LoadingState`/
  `EmptyState` (also extracted to `src/components/` so `Dashboard.jsx` and `Questions.jsx` both
  reuse them instead of duplicating). Search state lives in the URL (`useSearchParams`, `?
  search=`) rather than local component state — typing updates the URL (`replace: true`, no
  history spam), and the fetch effect keys off the URL param. This is what makes "arrive
  directly at /questions" and "arrive at /questions?search=zakat from the Dashboard" both just
  work as the same code path. No answered/pending filter yet — that needs the backend's
  `isAnswered`/`status` work (see `BE_PLAN.md`).
  - **Dashboard's hero search no longer shows results inline.** It only holds the typed text
    locally and, on submit (button click or Enter — it's a `<form>` now), navigates to
    `/questions?search=<query>`. The Dashboard is a landing page now, not also a second search
    results view — `Questions.jsx` is the one and only place Q&A browsing/search results live.
  - Known pre-existing oddity, not introduced or fixed here: `QuestionCard`'s asker
    name/photo links to `/detail-admin/${adminId}` with `adminId` hardcoded to `false`
    everywhere it's used (Dashboard did this before too) — that route/page isn't a real user
    profile page, so this link doesn't actually go anywhere useful yet. Left as-is since fixing
    it is unrelated to this task; worth a real look whenever `DetailAdmin.jsx` gets built out.
- [ ] **Build the "Pertanyaan Saya" panel in `CreateQuestion.jsx` for real.** Currently fully
  mocked static markup (CreateQuestion.jsx:110-208). Fetch `GET /api/question?search=` and
  filter client-side to `question.userId === me.id` as a stopgap (the endpoint has no per-user
  filter yet). **Mark this filter clearly as temporary** — swap to `GET /api/question/mine`
  once `BE_PLAN.md` ships it, don't build more on top of the client-filter approach.
- [~] **Centralize the API base URL.** Added `src/lib/api.js` exporting `API_URL` (reads
  `VITE_API_URL`, falls back to `http://localhost:5236`) and switched `Dashboard.jsx`,
  `QuestionCard.jsx`, `Header.jsx`, `DetailQuestion.jsx`, `AuthProvider.jsx`, `EditProfile.jsx`
  over to it. Still hardcoded in `Login.jsx` and one fetch in `CreateQuestion.jsx` — trivial,
  migrate whenever those files are next touched.
- [x] **Default avatar + broken-image fallback (2026-07-19).** Two separate bugs:
  - `/default-avatar.png` was referenced in 5+ places but the file never existed in `public/`
    — every "no picture" fallback was itself a broken image. Added a real
    `public/default-avatar.png` (simple generic person icon in the app's palette).
  - `AuthProvider.jsx` unconditionally did `profileData.picture = API_URL + profileData.picture`
    even when the backend returned `null` — turning "no picture" into the literal string
    `".../null"`, which is truthy, so `Profile.jsx`/`EditProfile.jsx`'s `profile.picture ||
    fallback` never triggered. Fixed to only prepend the URL when a picture actually exists.
  - Added `src/lib/image.js` (`handleAvatarError`) and wired `onError` onto every avatar
    `<img>` (`Header.jsx`, `QuestionCard.jsx`, `Dashboard.jsx`'s `AnsweredCard`,
    `DetailQuestion.jsx` ×2, `Profile.jsx`, `EditProfile.jsx`) so a picture that's *provided but
    broken* (404, deleted upload, bad path) also falls back instead of showing a broken-image
    icon — the old ternaries only handled "no picture provided at all".
  - `Profile.jsx`/`EditProfile.jsx` also stopped depending on an external Wikipedia URL as their
    fallback (unreliable, and inconsistent with every other avatar in the app) — now use the
    same local `/default-avatar.png` as everywhere else.
- [x] **Fixed "Invalid Date" on the Dashboard (2026-07-19).** `GET /api/question/{id}`
  (`QuestionControllers.cs` `GetDetailQuestion`) never returns `createdAt` on the question
  itself. `Dashboard.jsx`'s answered-questions fetch builds its data from that detail endpoint,
  so `question.createdAt` was `undefined` → `new Date(undefined)` → "Invalid Date" in every
  `AnsweredCard`. Fixed by merging each list item (which does have `createdAt`) into its detail
  response client-side, no backend change needed. Also extracted `formatDate` into
  `src/lib/date.js` (used by `Dashboard.jsx` and `QuestionCard.jsx` now) with a guard that
  returns an empty string instead of "Invalid Date" if a bad value ever gets in anyway.
- [x] **Hero section rewrite (2026-07-19).** Broadened the copy from Fiqh-specific framing to
  "any question about Islam" (Qur'an, Hadis, fiqih, muamalah, social issues, etc.) — the site
  isn't Fiqh-only. Search placeholder now cycles through `HERO_SEARCH_TOPICS` with a typewriter
  effect (types out, pauses, deletes, moves to next topic) instead of a static string — pauses
  automatically once the user actually types a query. Replaced the tag-pill "Populer:" row
  (linked to nothing, `href="#"`) with a clear "Ajukan Pertanyaan" CTA linking to
  `/create-question`, since asking a question is the actual point of the site — unauthenticated
  visitors get bounced to `/login` by the existing `AuthGuard`, same as every other protected
  route.
- [x] **Bahasa Indonesia audit.** Done — translated all known English leftovers across
  `Dashboard.jsx`, `Header.jsx`, `Footer.jsx`, `Login.jsx`, `Loading.jsx`, `Profile.jsx`,
  `CreateQuestion.jsx`, `EditProfile.jsx`, `ArticleCard.jsx`/`ArticleMemberCard.jsx`, plus alt
  text. `data-alt` attributes were left alone (inert leftover metadata from the original AI
  mockups — not real accessible/rendered text).
- [x] **Enriched Dashboard (2026-07-18).** Replaced the old "Pertanyaan Terbaru" + "Featured
  Articles" layout with: "Terbaru Terjawab" (latest answered), "Kumpulan Jawaban Penting"
  (verified-answer collection with a category radio filter), "Paling Banyak Dibaca" (most
  read), and an Articles section reworked to handle missing images. (The hero search's
  "Hasil Pencarian" inline results section mentioned here originally was later removed again —
  see the 2026-07-19 entry above, search results now live on `/questions` only.) Details on the
  workarounds used for data the backend doesn't provide (all documented in code comments in
  `Dashboard.jsx` too):
  - **Latest Answered / Important Answers** use real data: fetches the 10 most recent questions,
    then calls `GET /api/question/{id}` on each to find which have answers (N+1 — acceptable at
    today's question volume, not something to scale further; see `BE_PLAN.md` Phase 4 for the
    real fix). "Important" = an answer with `role === "Guru"`, which needed no new backend
    field.
  - **Category filter** operates on real questions but a fake category — `matchCategory()` in
    `Dashboard.jsx` keyword-matches title/content against a hardcoded Indonesian keyword list
    (sholat/puasa/zakat/keluarga/muamalah). Replace entirely once `BE_PLAN.md`'s `Category`
    field ships — do not build more filtering logic on top of this heuristic.
  - `ArticleCard`/`ArticleMemberCard` now accept `title`/`category`/`excerpt`/`image` props
    (previously fully hardcoded) and render a decorative fallback panel instead of an `<img>`
    when `image` is omitted — Articles are still otherwise fully mocked, no backend model
    exists for them (out of scope per the team's scope decision).
- [x] **Unified the three answered-question sections + real seed data (2026-07-18).** Since
  `GET /api/question` still can't distinguish "latest answered" vs "important" vs "most read",
  all three sections ("Jawab-jawaban Terbaru", "Kumpulan Jawaban Penting", "Paling Banyak
  Dibaca") now intentionally draw from the exact same `answeredQuestions` pool instead of
  faking a difference — no more Guru-only filter for "important" and no more static
  `MOST_READ_PLACEHOLDER` mock array, all three use the real `AnsweredCard` component. Also:
  - Renamed "Terbaru Terjawab" → "Jawab-jawaban Terbaru".
  - Empty states now use a proper `EmptyState` component (icon + title + message) instead of
    plain text; loading states got a matching `LoadingState` (spinner + message).
  - Each section shows 6 items (was 3) in the existing responsive `grid-cols-1 md:grid-cols-2
    lg:grid-cols-3` layout (2 rows of 3 on desktop). Recent-questions fetch batch bumped from
    10 → 15 to have a better chance of finding 6 answered ones.
  - Seeded 10 real dummy Q&A pairs (2 per category, answered by 2 dummy Guru users) into the
    local Postgres DB so these sections have real content to render instead of empty states.
    The seed script is committed at `backend/seed-dummy-data.sql` — re-run it against any local
    dev DB with `psql -f backend/seed-dummy-data.sql` (not idempotent, fresh/local DB only).

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
- [ ] Give "Jawab-jawaban Terbaru" / "Kumpulan Jawaban Penting" / "Paling Banyak Dibaca" real,
  distinct data once `BE_PLAN.md` ships an answered-at signal, category, and view counts —
  right now they're intentionally identical (see note above) since there's nothing to
  distinguish them by yet.

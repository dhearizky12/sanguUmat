# Sangu Umat — Frontend Plan

Owned by the frontend developer (this session's focus). See `PLAN.md` for the API contract —
everything below in "Ready now" only depends on endpoints already implemented there.
Everything in "Blocked" is intentionally not started until `BE_PLAN.md` marks the endpoint done.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done

## Ready now (this session)

- [x] **Fixed `Header.jsx` nav wrapping onto two lines (2026-07-19).** The nav bar used a rigid
  `grid-cols-2 md:grid-cols-4` with the menu list pinned to exactly 2 of 4 columns regardless
  of how many items were inside, and labels had no `whitespace-nowrap` — adding "Jawab
  Pertanyaan" (a 5th, longer item) pushed it over the available width and every multi-word
  label started wrapping to two lines. Replaced with a flex layout (`flex justify-between`,
  logo and avatar sections `shrink-0`, the nav section `flex-1` so it takes whatever space
  remains instead of a fixed fraction) and added `whitespace-nowrap` to every label — scales
  correctly regardless of how many menu items exist going forward (e.g. once "Admin" is wired
  up for real).

- [x] **Guru "Jawab Pertanyaan" answering queue (2026-07-19).** New page at
  `/jawab-pertanyaan`, its own top-level nav item (shown only when `me?.role === "Guru"`,
  positioned right after "Tanya Jawab") — deliberately *not* nested under `/question/*`, since
  it's a distinct audience/purpose from the general Tanya Jawab hub, not a sub-page of it.
  Lists only unanswered questions (same N+1 list-then-detail-filter pattern used everywhere
  else this session — `GET /api/question` has no `isAnswered` filter yet, see `BE_PLAN.md`),
  with the same category chips as `Questions.jsx`. Each card links into the existing
  `DetailQuestion.jsx`, which already has the "Tulis Jawaban" form gated to `role === "Guru"`
  — this page is a triage/discovery queue only, it doesn't duplicate the answer-submission UI.
  Verified against the live DB: 3 real unanswered questions surface correctly.
  - Added `src/components/RoleGuard.jsx` — the first role-gated route in the app (this page
    requires `me?.role === "Guru"`, redirects to `/` otherwise, to `/login` if not even
    authenticated). Written generically (`allow={["Guru"]}` prop) so the still-blocked Admin
    panel can reuse it later instead of writing a one-off check — see `BE_PLAN.md` Phase 2.
  - Promoted `fatikhunnizam@gmail.com` to `Guru` directly in the local DB for demo purposes
    (both duplicate rows sharing that email, so whichever session is active picks it up).
    **You'll need to log out/in or refresh once for the client to pick up the new role** —
    `AuthProvider.jsx` only fetches `/api/auth/me` on mount, it's not re-checked automatically.

- [x] **Edit own unanswered question (2026-07-19).** `DetailQuestion.jsx` now shows an "Edit"
  link next to the category pill when `me?.id === question.userId && question.answers.length
  === 0` — the moment an answer lands, the edit option disappears (client-side only; see the
  server-side note below). Clicking it swaps the question header into an inline form
  (title + content, same styling as `CreateQuestion.jsx`'s form) with Simpan/Batal.
  **This is blocked on the backend** — `PUT /api/question/{id}` doesn't exist yet (confirmed
  via a direct curl: 405, no PUT route mapped). Built the FE wired to the correct real shape
  anyway rather than faking a local-only save — a silent fake "save" for a user's own question
  content would be actively misleading (they'd think it persisted; it wouldn't have), unlike
  the `CommentSection` mock where that trade-off was fine. Right now clicking "Simpan" will
  show "Fitur ini belum didukung oleh server." until `BE_PLAN.md`'s `PUT /api/question/{id}`
  ships — at that point this should just start working, no FE change needed except removing
  this note. **Important:** the "only if unanswered" rule is only enforced client-side today —
  `BE_PLAN.md` flags that the real endpoint must also enforce owner-only + zero-answers
  server-side, since a client-side check alone is trivially bypassed via a direct API call.

- [x] **Delete own unanswered question (2026-07-19).** Same eligibility as the edit above
  (`canEditQuestion`, reused as-is) — a "Hapus" button next to "Edit," confirm dialog, then
  `DELETE /api/question/{id}` and redirect to `/questions` on success. Same blocked-on-backend
  situation: confirmed via curl this also 405s (no DELETE route mapped either), wired to the
  real endpoint rather than faking success for the same reason as the edit. Noted in
  `BE_PLAN.md` that the real permission shape should differ slightly from `DeleteAnswer`'s
  owner-or-Admin: owner can only delete while unanswered, but Admin should be able to delete
  regardless (moderation shouldn't be blocked by that rule).

- [x] **Added a related-questions sidebar to `DetailQuestion.jsx` (2026-07-19).** The page had
  gone full `max-w-container-max` width for consistency with the rest of the site, but that
  left long-form answer text stretching edge to edge with nothing else on the page — looked
  plain, and the width fix effectively undid a lot of the earlier reading-width benefit.
  Restructured into a two-column layout (`lg:grid-cols-3`, content `lg:col-span-2`, sidebar
  `lg:col-span-1`, stacks to one column below `lg`) with a sticky sidebar containing:
  - **"Pertanyaan Terkait"** — real data, not mocked: fetches the full question list and ranks
    same-category questions first (via the existing `matchCategory` heuristic from
    `lib/category.js`, same one used everywhere else category is faked), falling back to most
    recent otherwise, capped at 5. Verified the ranking against the live seeded data before
    calling it done — a Zakat question correctly surfaces the other Zakat question first, then
    fills the rest with recent ones.
  - A small "Punya Pertanyaan Lain?" prompt card linking to `/question/create`, so the sidebar
    isn't just one block and reinforces the same conversion goal as the Dashboard hero.

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
  - **Follow-up (2026-07-19): debounced the search-as-you-type.** Was firing a fetch on every
    keystroke (URL param updated directly in `onChange`). Now the input's displayed value is
    local state (`inputValue`) updated instantly on every keystroke so typing feels responsive,
    while the URL param (and therefore the actual fetch, which stays keyed on it) only updates
    400ms after the user stops typing. Syncing `inputValue` back from the URL when it changes
    externally (e.g. arriving from the Dashboard hero search) is done by adjusting state
    directly during render rather than in a `useEffect` — React's documented pattern for
    "derive state from a prop that can also change externally," and avoids an ESLint
    `react-hooks` error this repo enforces (`set-state-in-effect`) against calling `setState`
    synchronously inside an effect body.
  - Known pre-existing oddity, not introduced or fixed here: `QuestionCard`'s asker
    name/photo links to `/detail-admin/${adminId}` with `adminId` hardcoded to `false`
    everywhere it's used (Dashboard did this before too) — that route/page isn't a real user
    profile page, so this link doesn't actually go anywhere useful yet. Left as-is since fixing
    it is unrelated to this task; worth a real look whenever `DetailAdmin.jsx` gets built out.
- [x] **Redesigned `CreateQuestion.jsx` + built "Pertanyaan Saya" for real (2026-07-19).** Was
  visually its own thing — no `max-w-container-max`, an ad-hoc 12-col 5/7 grid split instead of
  the `lg:grid-cols-3` content+sidebar pattern established on `DetailQuestion.jsx`, hardcoded
  `http://localhost:5236` instead of `API_URL`, `text-white`/arbitrary-value shadows instead of
  the design-system tokens, and a 100%-mocked "Pertanyaan Saya" list (including a "Draft" state
  that doesn't correspond to anything real — there's no draft-saving mechanism at all). Now
  matches the same container width and sidebar structure as the rest of the app, and
  "Pertanyaan Saya" is real: filters `GET /api/question` to `userId === me.id`, then fetches
  each one's detail (same N+1 pattern as `Dashboard.jsx` — reasonable at "one person's own
  questions" scale) to show a real Terjawab/Menunggu status and category tag. Verified against
  the live DB: user id 1's 5 real questions show up with correct statuses. List refetches after
  a successful submission so a new question appears without a full page reload. Also: added
  basic empty-field validation (previously submitting blank fields just silently POSTed empty
  strings with no feedback), a real form `onSubmit` (Enter-to-submit, matching the Dashboard
  hero's pattern) with an actual failure alert, and renamed the page heading + `Header.jsx`'s
  nav button from "Buat Pertanyaan" to "Ajukan Pertanyaan" to match the wording used everywhere
  else that links here (Dashboard hero, Questions page, DetailQuestion sidebar).
  Swap the client-side `userId === me.id` filter for `GET /api/question/mine` once `BE_PLAN.md`
  ships it — don't build further on top of the filter approach.
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
  - **Follow-up (2026-07-19): cohesion pass.** Two problems: the "Cari" button was `rounded-xl`
    while literally every other button in the app is `rounded-full` — fixed to match. And
    having two full boxed buttons stacked in the hero (search's "Cari" + a separate "Ajukan
    Pertanyaan" pill below it) read as two competing equal-weight CTAs. Demoted "Ajukan
    Pertanyaan" from a button to an inline text link ("Tidak menemukan jawabannya? *Ajukan
    Pertanyaan*") directly under the search bar — now there's one real button (search) and one
    lightweight secondary path, not two buttons asking for equal attention.
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
- [x] **Admin moderation: delete question/answer/comment (2026-07-21).** Three fixes/additions
  so an Admin can moderate anything, not just their own content:
  - `DetailQuestion.jsx`'s answer-delete condition was `me?.id === item.userId && (role ===
    "Admin" || "Guru")` — an Admin could never see the delete option on someone else's answer
    even though `AnswerController.DeleteAnswer` already permitted it server-side. Fixed to
    `me?.id === item.userId || me?.role === "Admin"`.
  - Question delete: split the combined `canEditQuestion` gate into `canEditQuestion` (owner +
    zero-answers, unchanged — editing content stays owner-only, no Admin bypass) and a separate
    `canDeleteQuestion` (`canEditQuestion || role === "Admin"`), so Admin now sees "Hapus"
    regardless of answer count. `BE_PLAN.md`'s `DELETE /api/question/{id}` shipped the same day
    to back this — see below.
  - Comment delete: added a per-comment delete button (owner or Admin) to the still-100%-mock
    `CommentSection.jsx`. Since there's no backend Comment model at all yet (`BE_PLAN.md` Phase
    5), this only filters local component state — same fidelity trade-off already accepted for
    the rest of that component (not persisted, resets on reload).
- [x] **`DELETE /api/question/{id}` now implemented (2026-07-21).** The button built 2026-07-19
  was wired to a 405 the whole time — backend now has the endpoint (owner-zero-answers-only,
  or Admin unconditionally; see `BE_PLAN.md` Phase 3). Swapped the FE's generic "fitur belum
  didukung" alert for real 403 (no permission) / 409 (has answers) messages.

## Blocked — waiting on `BE_PLAN.md`

- [ ] Admin user-management page (real `DetailAdmin.jsx` build-out + a `RoleGuard` component
  alongside `AuthGuard.jsx`) — needs `GET/PATCH /api/admin/users`.
- [ ] Answered/pending filter + Guru "needs your answer" queue in `Questions.jsx` — needs
  `isAnswered`/`?status=` on `GET /api/question`.
- [ ] Edit-answer UI in `DetailQuestion.jsx` — needs `PUT /api/answer/{id}`.
- [ ] Real comment persistence + delete (`CommentSection.jsx` is still 100% local mock) — needs
  `BE_PLAN.md` Phase 5 (`Comment` model + GET/POST/DELETE).
- [ ] Swap "Pertanyaan Saya" from client-side filter to `GET /api/question/mine`.
- [ ] Replace `Dashboard.jsx`'s `matchCategory()` keyword heuristic with a real `?category=`
  filter once `BE_PLAN.md`'s `Category` field ships.
- [ ] Replace `Dashboard.jsx`'s N+1 "fetch 10 questions then detail-fetch each" with a proper
  `isAnswered`/`?status=` query once `BE_PLAN.md` ships it.
- [ ] Give "Jawab-jawaban Terbaru" / "Kumpulan Jawaban Penting" / "Paling Banyak Dibaca" real,
  distinct data once `BE_PLAN.md` ships an answered-at signal, category, and view counts —
  right now they're intentionally identical (see note above) since there's nothing to
  distinguish them by yet.

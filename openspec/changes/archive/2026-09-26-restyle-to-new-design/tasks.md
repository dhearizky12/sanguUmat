## 1. Extract the design system

- [x] 1.1 Reconcile the theme with the canvases: set the container token to the
      design's 1160px, and add tokens for the "Khusus Anggota" badge
      (`#F0E4BE` background, `#7A5E12` text) and any other canvas colour with no
      token yet.
- [x] 1.2 Move the pulsing live indicator into the theme as an animation token;
      delete the hand-written `.animate-sg-pulse` rule and its `@keyframes`.
- [x] 1.3 Add a token for the responsive page gutter the canvases use
      (`clamp(18px, 5vw, 28px)`), so no page hardcodes it.
- [x] 1.4 Confirm Newsreader and IBM Plex Mono load with the weights and optical
      sizes the canvases ask for, and that each has a real fallback stack.

## 2. Build the shared primitives

- [x] 2.1 `SectionHeading` — the title, right-hand mono meta, and rule beneath,
      repeated in every canvas section.
- [x] 2.2 `MonoLabel` — the uppercase IBM Plex Mono label, replacing the
      `label-mono` utility at its call sites.
- [x] 2.3 `LogoMark` — the real logo (`public/logo.png`) in place of the
      canvases' inset-shadow square, with a forest tone and a light tone for
      dark backgrounds, replacing the two long arbitrary-value strings in
      `Header` and `Footer`.
- [x] 2.4 `PlaceholderTexture` — the diagonal repeating gradient used for
      missing images and video, replacing the four copies.
- [x] 2.5 `AutoGrid` — the `repeat(auto-fit, minmax(min(Npx, 100%), 1fr))` grid,
      replacing all four inline `style={{ gridTemplateColumns }}` uses.
- [x] 2.6 `Breadcrumb` — the "Beranda / …" trail on every inner canvas.
- [x] 2.7 `VerifiedBadge` — the ustadz check mark from the home and Tanya Jawab
      canvases.
- [x] 2.8 Verify no inline `style={{` remains in the frontend source.
- [x] 2.9 `Button` — the solid, outline and gold mono-label buttons, replacing
      the utility strings repeated across `Header` and the dashboard.
- [x] 2.10 `Avatar` — the user's picture, or their initial on one forest circle
      for everyone when there is none or it fails to load; replaces
      `default-avatar.png`.

## 3. Convert the shared components

- [x] 3.1 `EmptyState` — adopt the canvases' dashed-border empty state, with
      their Bahasa Indonesia wording and call to action.
- [x] 3.2 `Loading` and `LoadingState`.
- [x] 3.3 `RichContent` — the answer and question body typography.
- [x] 3.4 `QuestionCard` — to the canvases' question row. Keep the base-path
      `pictureUrl()` handling and the view and comment counts.
- [x] 3.5 `CommentSection` — keep the owner and admin delete rules intact.
- [x] 3.6 Exercise every page that renders these, confirming behaviour is
      unchanged against `openspec/specs/`.

## 4. Convert the question pages

- [x] 4.1 Split `DetailQuestion` (493 lines) into sections before converting,
      mirroring `components/dashboard/`.
- [x] 4.2 Convert `DetailQuestion`, preserving the owner edit and delete rules,
      the admin moderation rules, and the single view-count call per visit.
- [x] 4.3 Convert `Questions` to the Tanya Jawab canvas: layout, type,
      breadcrumb and empty state, keeping today's search and category filter.
      Leave out the facet panel, sort control and pagination.
- [x] 4.4 Convert `CreateQuestion` to the Ajukan Pertanyaan canvas, including
      the "Perlu masuk" interstitial and the "Pertanyaan saya" panel. Leave out
      quota, ticket, review status tabs, anonymity and the ustadz picker.

## 5. Convert the account pages

- [x] 5.1 Convert `Login` to the Masuk canvas, Google path only. Leave out the
      WhatsApp OTP path and every element belonging to it. Both panels' content sits
      inside the shared 1160px container so the page lines up with every other
      page; the green panel's background still runs to the window's right edge.
- [x] 5.2 Convert `Profile`.
- [x] 5.3 Convert `EditProfile`, keeping the avatar upload and the
      profile-completion gate.

## 6. Convert the Guru and Admin pages

- [x] 6.1 Convert `AnswerQueue`, keeping it reachable only by a Guru.
- [x] 6.2 Convert `AdminUsers`, keeping the role control and the
      self-demotion guard.
- [x] 6.3 Convert `DetailAdmin`.

## 7. Restyle the three shells

- [x] 7.1 `Articles` and `DetailArticle` — header, footer and an empty state
      saying the section is not open yet. No placeholder articles.
- [x] 7.2 `Live` — the same treatment.
- [x] 7.3 Replace the hardcoded placeholder content in
      `components/dashboard/ArticlesSection.jsx` and
      `NgajiBarengSection.jsx` with an honest empty state, or hide the sections
      until their features exist.

## 8. Retire the old design system

- [x] 8.1 Confirm nothing references the old tokens: `bg-surface`,
      `text-on-surface`, `primary-container`, `outline-variant`, `font-body-md`,
      `text-body-md` and their siblings.
- [x] 8.2 Delete those tokens and their `@utility` blocks from `index.css`.
- [x] 8.3 Remove the Material Symbols icon font if the conversion replaced every
      use of it.
- [x] 8.4 Confirm no raw hex colour remains in any component or page.

## 9. Verify

- [x] 9.1 `npm run build` succeeds and `npx eslint src/` reports no more than
      the 5 known pre-existing errors in `EditProfile` and `AuthProvider`.
- [x] 9.2 Every page renders at 400px wide with no horizontal scrollbar on the
      body.
- [x] 9.3 No English user-facing text remains on any converted page.
- [x] 9.4 Walk each capability in `openspec/specs/` against the running app,
      confirming the restyle changed appearance only.
- [x] 9.5 Compare each converted page against its canvas.

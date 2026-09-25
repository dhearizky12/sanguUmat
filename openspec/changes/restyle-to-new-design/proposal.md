## Why

The new design has landed on three files — `Dashboard`, `Header`, `Footer` — and
the components under `components/dashboard/`. Eighteen other pages and
components still use the old Material-ish tokens, so navigating out of the home
page drops you onto an old-design page still wearing the new header. The app
cannot be judged, demoed or built on until it looks like one product.

Doing this first also settles the styling vocabulary. Every later change on the
roadmap adds surface; each one added before the tokens and primitives exist is
one more file to convert later.

## What Changes

Frontend only. No backend, no API, no schema, no new endpoint.

- Extract the design system from `claude-design/`: colour, type, spacing and
  animation as Tailwind theme tokens, plus shared React primitives for the parts
  the canvases repeat — section header, mono label, question row, facet panel,
  pagination, empty state, breadcrumb, the logo mark, and the placeholder
  textures.
- Port the eighteen remaining files onto that system: `Questions`,
  `DetailQuestion`, `CreateQuestion`, `Login`, `Profile`, `EditProfile`,
  `AnswerQueue`, `AdminUsers`, `DetailAdmin`, `Articles`, `DetailArticle`,
  `Live`, `QuestionCard`, `CommentSection`, `RichContent`, `EmptyState`,
  `Loading`, `LoadingState`.
- Pay off the Tailwind debt in the code already converted: four inline
  `style={{ gridTemplateColumns }}` grids, six long arbitrary-value class
  strings (the logo mark's triple inset shadow, four placeholder gradients), and
  the hand-written `.animate-sg-pulse` rule with its `@keyframes`.
- Retire the old tokens once nothing references them: the `@utility` blocks for
  `text-body-lg`, `text-title-md`, `text-label-sm`, `text-headline-lg` and their
  siblings, and the Material Symbols icon font if the design replaces every use.
- Add the copy and states the canvases specify for pages that already work:
  breadcrumbs, the "Perlu masuk" interstitial on Ajukan Pertanyaan, and the
  empty states with their Bahasa Indonesia wording.

Explicitly NOT in this change — each is its own entry on the roadmap: the
faceted filters, sort and pagination on Tanya Jawab; the quota, ticket and
review queue on Ajukan Pertanyaan; the WhatsApp OTP path on Masuk; and any real
content behind Artikel or Ngaji Bareng. Those pages are restyled around what
works today, and the canvas parts that need a backend are left out rather than
faked. `Articles`, `DetailArticle` and `Live` stay shells — restyled so they are
no longer visibly broken, but still empty.

## Capabilities

### New Capabilities

- `design-system`: the shared visual vocabulary every page is built from, and
  the rules that keep it one system — Tailwind-only styling, tokens as the
  single source of colour and type, primitives over repeated utility strings,
  and Bahasa Indonesia throughout.

### Modified Capabilities

None. This change alters how the app looks, not what it does. The requirements
under `questions`, `answers`, `answer-comments`, `auth`, `user-profile` and
`admin-users` all hold unchanged.

## Impact

- `frontend/src/index.css` — the Tailwind theme; old tokens removed.
- `frontend/src/components/` — new primitives; every existing component
  converted.
- `frontend/src/pages/` — all pages converted.
- `claude-design/` is the reference. It is a read-only prototype bundle; nothing
  in it ships.
- No backend file changes. No migration. No dependency added or removed beyond
  what the design's fonts need.
- Risk is concentrated in shared components: `QuestionCard` and `CommentSection`
  render on several pages, so converting them shifts more than one screen at
  once.

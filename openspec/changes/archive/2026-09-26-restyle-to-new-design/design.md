## Context

`claude-design/` holds six canvases exported from Claude Design: Sangu Umat
(home), Tanya Jawab, Ajukan Pertanyaan, Artikel, Ngaji Bareng and Masuk. They
are HTML prototypes — every value is an inline style, so they read as a
specification of the visual output, not as code to copy.

Three files and the `components/dashboard/` set already implement the home
canvas. The tokens they introduced in `frontend/src/index.css` match the
canvases exactly, so the palette is settled; what is missing is coverage. The
same file still carries the whole old Material token set, because eighteen files
still reference it.

Two discrepancies exist between the tokens and the canvases:
`--spacing-container-max` is `1200px` where every canvas uses `1160px`, and the
"Khusus Anggota" badge colours (`#F0E4BE` on `#7A5E12`) have no token.

The existing conversions also broke the Tailwind-only rule in ways worth not
repeating: four inline `style={{ gridTemplateColumns }}` grids, six long
arbitrary-value class strings, and a hand-written `.animate-sg-pulse` with its
own `@keyframes`.

## Goals / Non-Goals

**Goals:**
- One design system in use on every page.
- Tokens and primitives established before the roadmap's feature work begins.
- The Tailwind-only and Bahasa Indonesia rules hold across the whole frontend.
- The old token set gone, not merely unused.

**Non-Goals:**
- Any backend change. No endpoint, no schema, no migration.
- The features the canvases show that have no backend: facets, sort and paging;
  quota, ticket and review; WhatsApp OTP; article and ngaji content. Each is its
  own roadmap entry.
- Real content for Artikel and Ngaji Bareng. Those pages stay shells.
- Payment, membership gating, or anything behind "Jadi Anggota".

## Decisions

**Extract the system first, convert second.** Tokens and primitives land before
any page is converted, so conversions consume a finished vocabulary instead of
inventing one eighteen times. The alternative — convert page by page and let the
system emerge — is how the current split happened.

**Primitives are React components, never CSS classes.** The canvases repeat a
small set of constructs: a section header with a rule under it, a mono
uppercase label, a question row, an empty state, a breadcrumb, the logo mark,
and the diagonal placeholder texture. Each becomes a component. This is what
keeps a repeated utility string from being "solved" with a hand-written class.

**Delete old tokens in the same change that orphans them.** Leaving them behind
is how a second parallel system survives. The last conversion task is followed
by a removal task, and the removal is verifiable: nothing references them.

**Convert shared components before pages.** `QuestionCard`, `CommentSection`,
`RichContent`, `EmptyState`, `Loading` and `LoadingState` render inside several
pages. Converting them first means each page is converted once, against
already-final children.

**`DetailQuestion` is split before it is converted.** At 493 lines it is more
than twice any other file and has no canvas of its own. Splitting it into
sections mirrors what was already done for the dashboard and keeps the
conversion reviewable.

**Pages whose canvas outruns the backend are built to the working subset.**
Tanya Jawab gets the design's layout, type and empty state but keeps today's
search box rather than a faked facet panel with invented counts. Ajukan
Pertanyaan gets the form and the "Perlu masuk" interstitial, without quota or
ticket. Masuk gets the design's layout with the Google path only. Inventing
counts or a fake OTP box would have to be unpicked later, and would make the
page look finished when it is not.

**Fonts come from the canvases:** Newsreader for display and body, IBM Plex
Mono for the uppercase labels. Both are already declared as `--font-serif` and
`--font-mono`.

## Risks / Trade-offs

**A page can regress while looking correct.** The conversion touches markup that
carries behaviour — form submission, role checks, owner checks on edit and
delete. A page can match its canvas and still have lost a guard. Every converted
page needs its behaviour exercised, not just its appearance, and the baseline
specs under `openspec/specs/` are what that is checked against.

**Shared components shift several pages at once.** Converting `QuestionCard` or
`CommentSection` changes every screen that renders them, so a mistake there is
not contained to one page.

**The three shells stay visibly empty.** `Articles`, `DetailArticle` and `Live`
end this change restyled but with nothing in them. That is honest about what
exists, but anyone opening them sees an empty page. The alternative — the
canvases' placeholder content, hardcoded — would read as a finished feature and
have to be torn out.

**Old tokens might be referenced from somewhere unscanned.** Removal is driven
by searching for references; a dynamically composed class name would not show
up. The palettes are visually distinct enough that a survivor should be obvious
on the page.

**The canvases are a moving reference.** They are a design export, not a
contract. Where a canvas conflicts with what the app can actually do, the
working behaviour wins and the gap goes on the roadmap.

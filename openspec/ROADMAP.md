# Sangu Umat — build roadmap

The sequence of OpenSpec changes that takes the app from what exists today to
what `claude-design/` shows. Each entry becomes its own change; this file only
records order and why.

Keep it current: when a change is archived, tick it here.

## Where things stand

Working end to end: Google sign-in and roles, profiles and avatars, questions
(ask, browse, search, detail, views, edit, delete), answers by Guru, comments,
and admin role management. These are specced under `openspec/specs/`.

The new design reaches only `Dashboard`, `Header`, `Footer` and
`components/dashboard/*`. Eighteen other files still use the old Material-ish
tokens, so the app is visibly half-redesigned.

The six canvases in `claude-design/` describe a considerably larger product
than the one that exists. Everything below the first two entries is design that
has no backend at all yet.

## Sequence

### 1. `restyle-to-new-design` — frontend only — ✓ archived 2026-09-26
Extract the design system (Tailwind theme tokens plus shared primitives), then
port the eighteen remaining files onto it. Clears the half-redesigned state and
settles one styling vocabulary before new features add surface. Also pays off
the Tailwind debt: four inline `style={{}}` grids, six long arbitrary-value
class strings, and a hand-rolled `.animate-sg-pulse`.

Pages whose canvas shows features that do not exist yet (quota and review on
Ajukan Pertanyaan, WhatsApp OTP on Masuk, facets and paging on Tanya Jawab) are
restyled around what works today. The missing parts arrive with their own
change, listed below.

### 2. `categories-as-data` — full stack — ✓ archived 2026-09-26
Move the fixed five-key category list out of `Categories.cs` and
`category.js` into a table an Admin edits, so the taxonomy grows without a
migration each time. The design's twelve topics then become data, not a code
change. Needs a backfill for questions already categorised and a decision on
uncategorised ones.

### 3. `listing-sort-pagination-facets` — full stack
Sort (Terbaru, Terlama, Paling banyak dibaca, Waktu baca tersingkat, Judul
A–Z), pagination, and facet counts on the questions endpoint. Every list in the
design needs these, so building them once unblocks Tanya Jawab, Artikel and
Ngaji Bareng alike. Depends on 2 for category facets.

### 4. `ustadz-profiles` — full stack
Promote Ustadz from a role string to something with a profile: Dewan Ustadz
listing, per-ustadz page, verified badge, and the per-ustadz facet counts the
Tanya Jawab and Artikel canvases filter on. Depends on 3 for facets.

### 5. `membership` — full stack
The tier behind "Khusus Anggota" and every "Jadi Anggota" call to action.
Start with an admin-granted membership flag and the gating rules; leave payment
to its own change. Gating must exist before Artikel and Ngaji Bareng ship, or
their member-only states have nothing to check.

### 6. `whatsapp-otp-login` — full stack
Second sign-in path beside Google: phone entry, OTP send, verify, resend
countdown, and rate limiting. Needs a WhatsApp Business provider chosen first.
Completes the Masuk canvas that change 1 restyles.

### 7. `whatsapp-notifications` — full stack
Notify an asker on WhatsApp when an ustadz starts answering. Depends on 6 for
the provider integration and a verified phone number.

### 8. `question-review-workflow` — full stack
Questions stop publishing instantly and enter a moderation queue: statuses,
ticket id, moderator notes, and the "Perbaiki pertanyaan" revision loop, with
the status tabs the Ajukan Pertanyaan canvas shows. The largest behavioural
change to an existing capability — it rewrites much of `specs/questions`.

### 9. `question-quota` — full stack
A monthly per-user question allowance, with the remaining count shown on the
form. Reads more naturally once 8 exists, since quota and review share a
lifecycle. Likely interacts with 5, if members get a larger allowance.

### 10. `question-extras` — full stack
Anonymous posting, consent to publish the answer, and directing a question to a
chosen ustadz. Depends on 4 for the ustadz picker.

### 11. `articles` — full stack
The Artikel capability: model, rubrics, authors including guest authors, read
time, read counts, the free/members-only flag, lead article, and the list with
facets, sort and paging. Depends on 3 and 5.

### 12. `ngaji-bareng` — full stack
Live sessions and the recordings archive: live state and viewer count, weekly
schedule in WIB, series and session numbering, durations, catatan ngaji, and
the member-only parts. Needs the video source decided first — an embed versus a
streaming provider. Depends on 3 and 5.

## Deferred, not yet sequenced

- Payment and billing behind `membership`.
- The home page details not yet built: the one/two-column list toggle, the
  "Sering dicari" suggestions, and the verified-ustadz badge.

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

Numbers are fixed ids, not a running count: 5 (`membership`), 6
(`whatsapp-otp-login`), 7 (`outside-notifications`), 8
(`question-review-workflow`) and 9 (`question-quota`) were dropped 2026-10-04 as
not needed, along with payment and billing. WhatsApp is out because it is paid;
Google sign-in and the in-app bell (`specs/notifications`) cover login and
notifications.

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

### 3. `listing-sort-pagination-facets` — full stack — ✓ archived 2026-09-26
Sort (Terbaru, Terlama, Paling banyak dibaca, Waktu baca tersingkat, Judul
A–Z), pagination, and facet counts on the questions endpoint. Every list in the
design needs these, so building them once unblocks Tanya Jawab, Artikel and
Ngaji Bareng alike. Depends on 2 for category facets.

### 4. `ustadz-profiles` — full stack — ✓ archived 2026-09-26
Promote Ustadz from a role string to something with a profile: Dewan Ustadz
listing, per-ustadz page, verified badge, and the per-ustadz facet counts the
Tanya Jawab and Artikel canvases filter on. Depends on 3 for facets. (The Ustadz
facet on Tanya Jawab already shipped with change 3, credited by featured answer;
this change adds the profile pages it can link to.)

### 10. `question-extras` — full stack — ✓ archived 2026-09-26
Anonymous posting, consent to publish the answer, and directing a question to a
chosen ustadz. Depends on 4 for the ustadz picker.

### 11. `articles` — full stack — ✓ archived 2026-09-26
The Artikel capability: model, rubrics, authors including guest authors, read
time, read counts, the free/members-only flag, lead article, and the list with
facets, sort and paging. Depends on 3.
(Shipped with every article free to read and no guest authors.)

### 12. `ngaji-bareng` — full stack — ✓ archived 2026-09-26
Live sessions and the recordings archive: live state and viewer count, weekly
schedule in WIB, series and session numbering, durations, catatan ngaji, and
the member-only parts. Needs the video source decided first — an embed versus a
streaming provider. Depends on 3.

Decided 2026-09-26: YouTube only. Each session is a pasted YouTube link (live
stream or upload) played in an embedded player; nothing is hosted here.

## Shipped outside the sequence

- `jwt-auth` — 2026-10-04: sign-in uses a bearer token instead of a cookie, so the
  static UI on sanguumat.web.id can use the API on another site.
- `ustadz-posts` — 2026-10-04: a Guru or Admin publishes a question with its answer in
  one step, credited "Diposting oleh"; answers everywhere can now be written with the
  rich text editor.
- `admin-as-ustadz` — 2026-10-04: every Admin is also an ustadz (answers, Dewan Ustadz,
  ustadz pages), and an Admin can be hidden from the ustadz lists in Panel Admin.
- `delete-user` — 2026-10-04: an Admin can delete a user and a member can delete their own
  account; the account is anonymised and what they wrote stays as "Hamba Allah".
- `header-account-menu` — 2026-10-04: header actions overflow into an avatar menu when there is
  more than one.

## Deferred, not yet sequenced

- ~~The home page details~~ — done 2026-09-26 in `home-page-sections`: live strip,
  stats line, Ngaji Bareng and Artikel Pilihan sections (the toggle and "Sering
  dicari" were already there; the verified-ustadz badge shipped with change 4).

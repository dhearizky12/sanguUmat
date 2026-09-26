# Design

## Context

- **Tanya Jawab's list:** it runs on `GET /api/question/browse`. The endpoint
  builds a lightweight in-memory index of matching rows, then counts facets,
  sorts and pages over it. It has an 8-per-page default, the five sort keys and
  the facet-count rule (each facet counted over every filter but its own). The
  frontend pairs it with `FacetPanel`, `Pagination`, `browseParams.js` for URL
  state, and `AutoGrid` / `QuestionCard`.
- **Existing text and uploads:**
  - Questions and answers are plain text, rendered through `RichContent`. There
    is no HTML anywhere yet, and no sanitiser.
  - Profile pictures upload to `wwwroot/uploads/` through
    `POST /api/auth/upload-picture`, with no type or size check, and
    `pictureUrl()` resolves the server-relative path.
- **Categories:** they are rows (`Category`, key plus name), and the `Question`
  foreign key is ON DELETE SET NULL.
- **Access errors:** access rules elsewhere return 401, 403 or 404 through
  `GetCurrentUserAsync` and `StatusCode(403)`. The Npgsql retrying strategy
  rules out explicit transactions, so every write is one `SaveChangesAsync`.

## Goals / Non-Goals

**Goals:**
- The browse endpoint and page mirror Tanya Jawab, so the two feel like one
  product and share components.
- The server is the only trust boundary for HTML: whatever the editor or any
  other client sends, stored HTML is already safe to render.
- The editor produces exactly the formatting the sanitiser keeps, so nothing an
  author sees in the editor disappears on save.

**Non-Goals:**
- Images, embeds, tables or code blocks inside the body.
- Autosave or revision history.
- Slugs in URLs: numeric ids, as for ustadz.
- Collecting orphaned cover files.

## Decisions

### Data model

The model is one table, `Articles`:

| Column | Notes |
| --- | --- |
| `Id` | |
| `Title` (160) | |
| `Summary` (300, nullable) | |
| `Body` (text) | Sanitised HTML. |
| `BodyText` (text) | The body with tags stripped. |
| `Cover` (nullable) | |
| `CategoryId` (nullable) | Foreign key, ON DELETE SET NULL. |
| `AuthorId` | Foreign key to `Users`, ON DELETE CASCADE, like questions. |
| `Status` (`"Draft"` or `"Published"`) | |
| `PublishedAt` (nullable) | Set on first publish and never cleared. |
| `ReadMinutes` | Computed from `BodyText` on save. |
| `CreatedAt`, `UpdatedAt` | |
| `Views` | |

Indexes: (`Status`, `PublishedAt`) and `AuthorId`.

- **Why `BodyText` is stored:** search, read time and the derived summary all
  need the text without tags. Computing it once on save keeps the browse index
  cheap, rather than stripping HTML for every row on every request. It is never
  sent to clients.
- **Status as a string:** it matches how roles are stored and reads clearly in
  SQL. A bool `IsPublished` was considered; a string leaves room for the
  review states the question workflow may later want.
- **`PublishedAt` survives unpublishing:** so republishing doesn't make an old
  article jump to "newest".

### Sanitising: `HtmlSanitizer` (Ganss.Xss) with a strict allowlist

Server-side, in a small `ArticleHtml` helper that returns both the clean HTML
and its text.

- **Allowed tags:** `p br h2 h3 strong em u s blockquote ul ol li hr a`.
- **Allowed attributes:** only `href` on `a`.
- **Allowed schemes:** `http`, `https` and `mailto`.
- **Links:** a post-process adds `target="_blank"` and
  `rel="noopener noreferrer nofollow"` to every link.
- **Other tags:** disallowed tags are unwrapped (children kept), via
  `KeepChildNodes = true`, so pasted content from Word or web pages degrades to
  plain paragraphs rather than vanishing.
- **Alternatives:**
  - A hand-rolled regex sanitiser is a well-known security hole.
  - Sanitising in the browser with DOMPurify at render time would leave unsafe
    HTML in the database and trust every reader's client.
  - Markdown was declined by the user in favour of a rich editor.

### Editor: TipTap v3 (StarterKit plus Placeholder)

- **Toolbar:** a Tailwind-styled toolbar in `components/article/Editor.jsx`.
- **Configuration:** StarterKit (TipTap v3, which bundles Link and Underline)
  is configured down to the allowlist: `heading` levels [2, 3], and `code` and
  `codeBlock` turned off. `getHTML()` is what is sent.
- **Links:** a small inline prompt (a `Field` plus "Terapkan" and "Hapus
  tautan"), not `window.prompt`, so the text stays in Indonesian and in the
  design.
- **Why TipTap:** ProseMirror-based, headless (no bundled CSS to fight
  Tailwind), React 19 compatible, and its output maps cleanly onto the
  allowlist.
- **Alternatives:** Quill brings its own theme CSS and a Delta format. Lexical
  has a heavier API for the same result. `contentEditable` by hand is fragile
  across browsers.

### Rendering the body

`components/article/ArticleBody.jsx` renders the stored HTML with
`dangerouslySetInnerHTML`, which is safe because it is sanitised on write.
Typography comes from a scoped set of Tailwind arbitrary child selectors on the
wrapper (`[&_h2]:…`, `[&_blockquote]:…`, `[&_a]:…`). The editor's content area
reuses the same class string, so the editor and the page look identical. There
is no `@tailwindcss/typography` plugin: the project is Tailwind-only with its
own tokens, and one shared class constant is enough.

### Browse endpoint: same shape as question browse

`GET /api/articles` loads a lightweight projection of published rows
(`Id, Title, Summary, BodyText length, CategoryKey, AuthorId, PublishedAt,
Views`). It filters search over `Title`, `Summary` and `BodyText` in SQL with
`ILIKE`, then counts facets, sorts and pages in memory exactly like
`Question/Browse`, and finally loads full items for the page ids only.

- **Read minutes:** `max(1, ceil(words / 200))`, where words is `BodyText`
  split on whitespace, stored in `ReadMinutes` on save. The
  "singkat" sort and the display then agree without recomputing. This beats the
  question rule's length ÷ 1,200 estimate because we have the real text.
- **Shared code:** the sort-key parsing and paging arithmetic are copied from
  the question controller, not extracted. Two call sites don't yet justify a
  shared abstraction, and extracting it would put a refactor of shipped code
  into this change.

### Sorotan: requested by the client, picked by the server

Only the client knows whether it is in one-column mode, so it asks with
`?lead=1`, sent whenever it is sorted by Terbaru, in one column, with no search
or filter. The server then applies the rest of the canvas's rule: more
than three matching articles, and the newest has a cover. When the rule holds,
it takes that article out of the paged list and returns it as `lead`. Paging
then runs over the remaining articles, so page 2 continues exactly where page 1
stopped. Otherwise `lead` is null and nothing changes.

The client keeps `lead=1` on later pages while the other conditions hold, so
page 2 stays page 2 of the same list. The server returns `lead` on every page so the count stays right, and the page
shows it on page 1 only.

Rejected: letting the client take `pageSize=9` on page 1. Page 2 at 8 a page
would then repeat item 8, because page-based paging cannot express "skip one".

### Covers

`POST /api/articles/cover` checks:
- the content type and magic bytes (JPEG `FF D8 FF`, PNG `89 50 4E 47`, WebP
  `RIFF…WEBP`) — never the extension alone;
- a size of at most 5 MB;
- and writes the file to `wwwroot/uploads/articles/{guid}.{ext}`.

The article stores that path, and on save any `cover` not matching
`^/uploads/articles/[0-9a-f-]{36}\.(jpg|png|webp)$` becomes null. Covers render
through `pictureUrl()`, which already handles server-relative paths under a base
path.

### Access helper

`ArticlesController.CanManage(user, article)` is
`user.Role == Admin || (user.Role == Guru && article.AuthorId == user.Id)`.
Create and cover upload require Guru or Admin. Draft reads use the same
predicate and answer 404, not 403, so a draft's existence isn't revealed.

### Routes

- `/articles`, `/articles/:id` and `/articles/tulis`: React Router ranks the
  static `tulis` and `saya` segments above `:id`.
- `/articles/saya` and `/articles/tulis` sit under a
  `RoleGuard allow={["Guru","Admin"]}`.
- `/articles/:id/ubah` sits under `AuthGuard`, and the page itself checks
  author-or-Admin once the article loads.
- `/detail-article/:slug` becomes `<Navigate to="/articles" replace>`.
- The Header's `matchPaths` keeps `/articles`.

### Unsaved changes

The page registers a `beforeunload` listener while the form differs from what
was loaded, and removes it before the save's own navigation. React Router's
`useBlocker` would also catch in-app links, but it needs a data router and the
app uses `<BrowserRouter>`. Converting the router is out of scope, so in-app
links are not blocked; the spec's scenario covers leaving the page (reload,
close, external navigation).

## Risks / Trade-offs

- **[Pasted rich content]** Pasting from Word or Docs brings spans and styles.
  → TipTap's schema already drops unknown marks in the editor, and the server
  sanitiser is the backstop. What the author sees after paste is what gets
  saved.
- **[Sanitiser drift]** The editor could gain a feature the sanitiser strips.
  → Both allowlists sit side by side in design and code comments, and a backend
  check saves the full toolbar's output and asserts it round-trips unchanged.
- **[Large bodies]** A 100,000-character cap bounds the row, and the browse
  projection never loads `Body`.
- **[In-memory facet counting]** This works well into thousands of articles, as
  for questions. → The same future move to SQL grouping applies to both.
- **[New dependencies]** TipTap adds about 100 KB gzipped to the bundle. → The
  editor page is lazy-loaded (`React.lazy`) so readers never download it.
- **[Orphaned covers]** Replacing or removing a cover leaves the file on disk.
  → Accepted for now; files are small and a cleanup job can come later.

## Migration Plan

- An additive migration creates `Articles`; it runs on boot like the others.
- Rollback: migrate back to `UstadzProfiles`, which drops the table.
  `uploads/articles/` can be deleted by hand.
- No backfill: there are no articles yet.

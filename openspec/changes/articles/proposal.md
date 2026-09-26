# Proposal

## Why

Artikel is one of the three sections in the main navigation, yet it is still a
"coming soon" placeholder. The ustadz can answer short questions but have no
place for the longer, structured pieces the Artikel canvas shows. Categories,
the browse pattern (facets, sort, paging) and ustadz profiles now exist, so
articles can be built on them rather than beside them.

Membership (roadmap 5) is skipped for now: every article is readable by
everyone, so the canvas's "Khusus Anggota" tag, the "Akses" facet and the "Jadi
Anggota" banner are left out until that change.

## What Changes

Touches **both backend and frontend**.

- New `Article` model: title, summary, sanitised HTML body, optional cover
  image, category (rubrik), author, draft/published status, published date,
  read count and read-time estimate.
- Articles are written by a Guru (their own) or an Admin (any), in a rich text
  editor. They can be saved as a draft and published when ready. An Admin can
  also edit, unpublish or delete any article.
- Rubrik reuse the Admin-managed categories. Deleting a category leaves its
  articles in "Lainnya", the same as questions.
- Server-side HTML sanitising: only a fixed set of formatting tags and safe
  links survive.
- New pages:
  - Artikel list (`/articles`) following the canvas.
  - Article page (`/articles/:id`).
  - Write/edit page (`/articles/tulis`, `/articles/:id/ubah`).
  - "Artikel saya" (`/articles/saya`): the author's drafts and published
    articles.
  - The old `/detail-article/:slug` placeholder link goes to `/articles`.
- The Artikel list follows the canvas:
  - Search, plus "Rubrik" and "Penulis" facets with counts, and the five sorts.
  - A one/two-column toggle and active-filter chips.
  - A "Sorotan" lead article, then numbered pagination at eight a page.

### New and changed endpoints

All responses are JSON. A signed-in caller is identified by the auth cookie.

| Method | Path | Auth | Response |
| --- | --- | --- | --- |
| GET | `/api/articles` | none | 200 `{ items, lead, total, totalPublished, page, pageSize, totalPages, facets: { categories, authors } }`. Each item is `{ id, title, summary, cover, category: { key, name } \| null, author: { id, name, picture }, publishedAt, readMinutes, views }`. Published articles only. `?lead=1` asks for the Sorotan article, returned apart from the paged list. |
| GET | `/api/articles/{id}` | none for published; author or Admin for a draft | 200 with the item fields plus `body`, `status` and `updatedAt`. 404 for a draft the caller may not see, or an unknown id. |
| POST | `/api/articles/{id}/view` | none | 200 `{ views }`. Counts one read of a published article. |
| GET | `/api/articles/mine` | Guru or Admin | 200 with the caller's own articles, drafts included, each with its `status` and `updatedAt`. |
| POST | `/api/articles` | Guru or Admin | 201 with the article. The body is `{ title, summary, body, cover, category, publish }`. |
| PUT | `/api/articles/{id}` | the author (still a Guru) or an Admin | 200 with the article. Same body as POST; `publish: false` on a published article unpublishes it. |
| DELETE | `/api/articles/{id}` | the author (still a Guru) or an Admin | 204. |
| POST | `/api/articles/cover` | Guru or Admin | 200 `{ cover }`. Multipart upload of a JPG, PNG or WebP of at most 5 MB. |

The Admin category endpoints and `GET /api/categories` also gain an
`articleCount`, so the delete prompt can say how many articles will become
"Lainnya".

## Capabilities

### New Capabilities

- `articles`: writing, publishing, reading and browsing long-form articles by
  the ustadz. Covers the model, sanitising, access rules, the list endpoint with
  facets, sort and paging, and the Artikel pages.

### Modified Capabilities

- `categories`: deleting a category also leaves its articles uncategorised. The
  delete prompt and the Kategori page count articles as well as questions.

## Impact

- **Backend:**
  - `Models/Article.cs` and a migration adding the `Articles` table.
  - `ArticlesController`.
  - `CategoriesController`, for article counts.
  - The HTML sanitiser NuGet package `HtmlSanitizer`.
  - `wwwroot/uploads/articles/` for covers.
- **Frontend:**
  - Pages: `Articles.jsx` and `DetailArticle.jsx` get real content, plus new
    `ArticleEdit.jsx` and `MyArticles.jsx`.
  - Components under `components/article/`, and routes in `App.jsx`.
  - Links: a "Tulis artikel" entry for Guru and Admin, and the Kategori page
    count.
  - Dependencies: the TipTap v3 editor packages (`@tiptap/react`,
    `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extensions`).
- **Data:** additive migration only. Nothing existing changes shape.
- **Out of scope:** membership gating, guest authors, images inside the article
  body, scheduled publishing, comments on articles, and article sections on the
  home page or an ustadz's page.

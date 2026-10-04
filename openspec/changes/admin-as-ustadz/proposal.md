# Proposal

## Why

Admins manage users, questions and content, but today an Admin cannot answer a
question or have an ustadz page. To let an ustadz also manage the site, they would
have to give up being an ustadz. At the same time, an Admin who only administers
(not a teacher) must not show up in the ustadz lists.

## What Changes

Touches **both backend and frontend**.

- An Admin can answer questions and sees the answer queue, its count in the header
  and the answer form, like a Guru.
- An Admin is also an ustadz by default: listed in Dewan Ustadz with a page, a
  profile and the gold tick, offered in every ustadz choice ("Ditujukan kepada",
  "Diposting atas nama", a kajian's ustadz), shown in the ustadz facet, counted on
  the home page, and sent the ustadz notifications.
- An Admin can **hide** an Admin (including themselves) from the ustadz lists. A
  hidden Admin is left out of all of the above and shows no tick, but can still
  answer as any Admin can.
- An Admin posting an ustadz post may now credit themselves; a hidden Admin must
  still name an ustadz.
- No new role: `User`, `Guru`, `Admin` stay as they are. One new flag on the user
  hides an Admin from the lists (migration, default off).
- Backend gets one rule for "is an ustadz" instead of scattered `Role == Guru`
  checks, and the frontend gets one helper for it.

API changes:

| Method | Path | Auth | Response |
| --- | --- | --- | --- |
| PATCH | `/api/admin/users/{id}/ustadz` | Admin | `{ hidden }` in; the updated user out (new) |
| GET | `/api/admin/users` | Admin | each user gains `hiddenAsUstadz` |
| POST | `/api/answer/{questionId}` | Guru or Admin | was Guru only |
| GET | `/api/ustadz`, `/api/ustadz/{id}` | public | now include Admins who are not hidden |
| GET | `/api/auth/me` | signed in | gains `isUstadz` |
| GET | `/api/question/{id}`, `/browse`, `/api/articles` | public | answers, list items and article authors gain `isUstadz`, so the UI can show the tick and the link |

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `answers`: Admins may answer and use the queue (two requirements renamed).
- `ustadz-profiles`: who counts as an ustadz; Admins have profiles and pages.
- `admin-users`: hiding an Admin from the ustadz lists.
- `questions`, `question-browsing`: directing to an Admin; an ustadz's answer
  featured; the ustadz facet.
- `notifications`: ustadz events reach Admins who are shown as ustadz.
- `ustadz-posts`: an Admin may post as themselves.
- `ngaji-bareng`, `articles`, `home-page`: an Admin ustadz can lead a kajian and gets
  the tick; the home count.

## Impact

- Backend: `User.HideAsUstadz` (migration), a shared ustadz rule, `AnswerController`,
  `QuestionControllers`, `UstadzController`, `Notifier`, `KajianController`,
  `ArticlesController`, `HomeController`, `AdminController`, `AuthController` (`me`).
- Frontend: a roles helper, `Header`, `App` routes, `DetailQuestion`, `AnswerItem`,
  `QuestionCard`, `ArticleByline`, `Profile`, `AdminUsers`, `PostForm`.
- Existing rows: unchanged. After deploy, the owner hides their own Admin account.

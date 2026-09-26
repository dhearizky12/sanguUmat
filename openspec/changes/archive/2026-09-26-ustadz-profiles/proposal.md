## Why

An ustadz is today only a role string on a user. Readers see a name and a gold
tick but cannot learn who is answering them — their background, what they
specialise in, where they studied — which is exactly what makes an answer
trustworthy. The footer already links to "Dewan Ustadz" and the app already has
a "Profil ustadz" placeholder page; both lead nowhere.

## What Changes

Both backend and frontend.

- Every Guru has an ustadz profile: a title/credentials line, a short bio, areas
  of expertise chosen from the categories, and an education history (institution,
  optional degree, optional start and end year). A new Guru starts with an empty
  profile.
- New endpoints:
  - `GET /api/ustadz` — public; `200` with
    `[{ id, name, picture, title, expertise: [{ key, name }], answerCount }]` for
    every Guru, most answers first.
  - `GET /api/ustadz/{id}` — public; `200` with
    `{ id, name, picture, title, bio, expertise, education: [{ institution, degree, startYear, endYear }], answerCount, joinedAt }`;
    `404` when the id is not a Guru.
  - `PUT /api/ustadz/{id}` — the ustadz themself or an Admin; body
    `{ title, bio, expertise: [keys], education: [...] }`; `200` with the
    profile; `400` with a Bahasa message for invalid input; `401` signed out,
    `403` for anyone else, `404` when not a Guru.
- A **Dewan Ustadz** page at `/ustadz` listing every ustadz.
- A page per ustadz at `/ustadz/:id`: their profile, and their answered questions
  paged through the existing browse endpoint filtered to them.
- An edit page at `/ustadz/:id/ubah` for the ustadz and for Admins, reached from
  the ustadz page, from a Guru's own profile page, and from the Guru rows in
  Panel Admin.
- Ustadz names link to their page on the question page, the Dewan Ustadz list
  and the footer's "Dewan Ustadz" link. Question cards stay a single link (a
  link cannot contain another), so names on cards do not link.
- The `/detail-admin/:id` placeholder is removed; old links redirect to
  `/ustadz/:id`.

## Capabilities

### New Capabilities

- `ustadz-profiles`: the ustadz profile data, the Dewan Ustadz list, the
  per-ustadz page, and who may edit a profile.

### Modified Capabilities

None. The answers, questions and browsing specs are unchanged; the per-ustadz
answer list reuses `question-browsing`'s `ustadz` filter.

## Impact

- Backend: `UstadzProfile`, `UstadzExpertise` and `UstadzEducation` models and a
  migration; a new `UstadzController`.
- Frontend: `pages/Ustadz.jsx` (list), `pages/UstadzDetail.jsx`,
  `pages/UstadzEdit.jsx`; links from `AnswerItem`, `Footer`, `Profile` and
  `AdminUsers`; `DetailAdmin` and its route removed.

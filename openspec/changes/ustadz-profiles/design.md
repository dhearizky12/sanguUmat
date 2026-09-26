## Context

Guru is a value of `Users.Role`. The question page shows answer authors with the
gold tick; the browse endpoint already filters by answerer (`ustadz=`) and its
facet lists Gurus by featured answer. `/detail-admin/:id` is a "coming soon"
placeholder nothing links to. Panel Admin changes roles from the users list.

## Goals / Non-Goals

**Goals:**
- A profile every Guru has without a setup step.
- One place to read an ustadz and one to edit, reused from every entry point.

**Non-Goals:**
- Slugs in the URL (numeric ids were chosen).
- Ustadz-to-question assignment, availability, or follow features.
- Verification workflow beyond the existing Guru role.

## Decisions

**Profile tables beside `Users`, not new columns on it.** `UstadzProfiles`
(`UserId` primary key and foreign key, `Title`, `Bio`, `UpdatedAt`),
`UstadzExpertise` (`UserId`, `CategoryId`, composite key, cascade on both) and
`UstadzEducation` (`Id`, `UserId`, `Institution`, `Degree`, `StartYear`,
`EndYear`, `SortOrder`). Keeps `User` about identity; expertise cascades away
when a category is deleted. A profile row is created on first save — reads treat
a missing row as an empty profile, so no backfill is needed.

**Who counts as an ustadz is the role, read live.** The list and page filter on
`Role == Guru`. Changing someone's role in Panel Admin adds or removes them
immediately; the profile rows stay, so a re-promoted Guru gets their profile
back.

**`answerCount` = answers on published questions**, one grouped count.

**Save replaces the whole profile.** `PUT` sends title, bio, expertise keys and
the full education list; the server replaces expertise and education rows in
one transaction. Simpler than per-row endpoints, and the edit page always has
the whole profile in hand.

**Answered questions reuse browse.** The ustadz page calls
`GET /api/question/browse?ustadz={id}&page=N` and renders `QuestionCard` with
`Pagination`, so paging, counts and published-only rules come for free.

**Links only where they are not nested.** `AnswerItem`'s author becomes a link;
`QuestionRow` stays one `NavLink`, since an `<a>` inside an `<a>` is invalid and
breaks keyboard and screen-reader navigation.

**Edit access in the client mirrors the server.** The edit page renders for the
ustadz and Admins and otherwise redirects to the public page; the server's 403
is the real guard.

## Risks / Trade-offs

- [An empty profile looks sparse on its public page] → missing parts are left
  out rather than shown empty, and the answer list carries the page.
- [Bio is plain text] → rendered with line breaks preserved; no rich text.

## Migration Plan

One additive migration creating the three tables. Rollback drops them; nothing
else depends on them.

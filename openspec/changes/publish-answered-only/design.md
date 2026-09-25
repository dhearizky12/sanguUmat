## Context

`GetQuestions` returns every question and applies `status` only as an optional
filter; `GetQuestion` and `RecordView` look questions up by id with no
visibility check. The Guru's related sidebar fetches the unfiltered list and
keeps the unanswered ones client-side. `DetailQuestion` calls `res.json()`
without checking the status, so a 404 leaves it stuck.

## Goals / Non-Goals

**Goals:**
- One visibility rule, enforced on the backend, applied the same way by list,
  detail and view counting.

**Non-Goals:**
- A review or moderation queue — roadmap change 8. Being answered is the only
  publication criterion here.
- Hiding answered questions or their answers from anyone.

## Decisions

**A single `CanSee(question, user)` rule: answered, or the user is its asker, a
Guru or an Admin.** Detail and view counting both call it; the list applies the
same rule as a query filter (`Answers.Any()` unless the caller is Guru/Admin
and asked for `pending`). Keeping it in one helper stops the three endpoints
drifting apart.

**404, not 403, for a hidden question.** A 403 would confirm that an
unanswered question exists at that id. 404 matches the unknown-id case, so the
page shows one "Pertanyaan tidak ditemukan" state for both.

**`status=pending` answers 403 to non-staff.** Unlike the detail case, the
caller knows exactly what they asked for; a 403 is the honest answer and keeps
the answer queue's behaviour explicit. `status=answered` becomes a no-op so the
home page's existing request keeps working.

**The Guru sidebar asks the server for pending questions** (`?status=pending`)
instead of filtering the full list, which no longer contains them.

**The detail page treats any non-OK response as not found.** It renders an
`EmptyState` with a link to Tanya Jawab, and does not record a view.

## Risks / Trade-offs

- [Existing links to unanswered questions stop working for the public] → that
  is the intent; once answered, the same link works again.
- [An Admin browsing Tanya Jawab no longer sees pending questions there] → they
  reach them through the answer queue's `status=pending` or by link; the public
  list stays identical for everyone.

# Tasks

## 1. Backend

- [x] 1.1 Add the `Notification` model, its indexes and the migration. Verify on
      a scratch copy of the local database: it applies and rolls back to
      `Kajian`.
- [x] 1.2 Add the `Notifier` service: recipients per rule, excluding the actor,
      one per person per event, `CanSee` for private questions, masking for
      anonymous askers, and merging for `question_new` and `question_edited`.
      Register it for dependency injection.
- [x] 1.3 Call the notifier from question create, update and delete, answer
      create and update, comment create, and role change. Each call must happen
      before the action's own save.
- [x] 1.4 Add `NotificationsController`: list, unread count, read, and
      read-all. Verify with curl each rule in the spec as the asker, a Guru, the
      directed Guru, a second commenter, an Admin and a stranger. Include
      merging, anonymous masking to a member, a private question never
      notifying a stranger, no self-notifications, and 401 and 404 on the
      endpoints.

## 2. Frontend

- [x] 2.1 Add `lib/timeAgo.js`, and the `NotificationBell` with its count,
      polling, focus refresh and dropdown ("Tandai semua dibaca", "Lihat
      semua", empty state, Escape and click-outside). Put it in the header,
      including the mobile menu.
- [x] 2.2 Add the `/notifikasi` page with pagination and read-all, behind
      `AuthGuard`.
- [x] 2.3 Add answer anchors (`#jawaban-{id}`) and scroll to them on the question
      page. Verify by opening a notification that links to an answer.
- [x] 2.4 Walk through in the browser: Budi asks a question directed to Hana, Hana
      sees it and answers, Budi sees the answer and comments, and Hana sees the
      comment. Then check the pages at 400px width, check that all text is
      Bahasa Indonesia, and run lint and the build.

## 3. Roadmap

- [ ] 3.1 On archive, record notifications in `openspec/ROADMAP.md`, and note
      that roadmap 7 (WhatsApp notifications) can reuse these events. Verify:
      `openspec validate notifications`.

# Proposal

## Why

Nothing tells people what happened while they were away:
- **Ustadz** only see a count on "Jawab Pertanyaan". It doesn't say whether a
  question was directed to them, or whether an asker replied under their
  answer.
- **Members** have no way to learn that their question was answered or that
  someone followed up on it, short of reopening "Pertanyaan saya".

Both gaps make the Q&A loop feel silent, and silent loops lose people.

## What Changes

Touches **both backend and frontend**.

- **New `Notification` model:** recipient, type, the actor's display name
  (masked where anonymity applies), a short Indonesian text, a link inside the
  app, an optional count, read/unread, and time.
- **Created on the server,** in the same save as the action that causes them.

  | Event | Who is notified |
  | --- | --- |
  | Question answered | The asker. |
  | Answer edited | The asker. |
  | Comment on an answer to their question | The asker, unless they wrote it. |
  | Comment after theirs on an answer | Everyone who commented earlier on that answer, except its writer and anyone already notified above. |
  | Question deleted by an Admin | The asker. |
  | Role changed by an Admin | That user. |
  | Question directed to them | That ustadz. |
  | New question in the queue | Every other ustadz. Unread ones merge into one "N pertanyaan baru menunggu jawaban". |
  | Comment on their answer | The ustadz who wrote it, unless they wrote the comment. |
  | Unanswered question edited by its asker | The directed ustadz, or every ustadz when it isn't directed. Merged per question while unread. |

  Nobody is ever notified of their own action.
- **Privacy:**
  - An anonymous asker appears as "Hamba Allah" in any notification sent to
    someone who may not see their name.
  - Private answers only ever notify people who can open them.
- **Header bell** for signed-in users:
  - an unread count (9+ above nine);
  - a dropdown with the latest 8, "Tandai semua dibaca" and "Lihat semua";
  - the count refreshes every 45 seconds while the tab is visible, and
    whenever the tab regains focus.
  
  "Jawab Pertanyaan" keeps its count.
- **`/notifikasi` page:** the full list, 20 a page, with unread ones marked.
  Opening a notification marks it read and goes to its link: the question,
  scrolled to the answer when relevant; the queue; the profile.

### New endpoints

| Method | Path | Auth | Response |
| --- | --- | --- | --- |
| GET | `/api/notifications?page=` | signed in | 200 `{ items, unread, page, totalPages }`. An item is `{ id, type, text, actor, link, count, read, createdAt }`, newest first. |
| GET | `/api/notifications/unread-count` | signed in | 200 `{ unread }`. Kept tiny for polling. |
| POST | `/api/notifications/{id}/read` | the recipient | 204. Anyone else gets 404. |
| POST | `/api/notifications/read-all` | signed in | 204. |

The existing endpoints that trigger notifications (`POST`/`PUT` question,
answer and comment; `DELETE` question; `PATCH` role) keep their responses.

## Capabilities

### New Capabilities

- `notifications`: which events notify whom, the privacy rules, merging, the
  bell and the Notifikasi page.

### Modified Capabilities

None. The triggering endpoints' contracts are unchanged; the notifications are
a side effect specified in the new capability.

## Impact

- **Backend:**
  - `Models/Notification.cs` and a migration.
  - A `Notifier` service called from `QuestionController`, `AnswerController`
    and `AdminController`.
  - `NotificationsController`.
- **Frontend:**
  - `components/NotificationBell.jsx` in `Header`;
  - `pages/Notifications.jsx` and its route.
  
  Answers get an `id` anchor so links can land on them.
- **Out of scope:**
  - email and WhatsApp delivery (WhatsApp is roadmap 7, which can reuse these
    events);
  - push or websocket updates;
  - per-type notification settings;
  - pruning old notifications.

## Purpose

In-app notifications: telling members and ustadz what happened to the questions,
answers and comments they are part of, so the Q&A loop is heard. They are
delivered in a header bell and a Notifikasi page.

## ADDED Requirements

### Requirement: Notification

A notification MUST belong to one recipient, and MUST carry its type, the
actor's display name, an Indonesian text, a link inside the app, an optional
count, whether it has been read, and when it was created.

#### Scenario: Never your own action

- **WHEN** a user's action would notify that same user
- **THEN** no notification is created for them

#### Scenario: One per person per event

- **WHEN** one action matches several rules for the same recipient
- **THEN** they receive a single notification, from the first matching rule in
  the order listed under Member events and Ustadz events

### Requirement: Member events

A member MUST be notified about what happens to their own questions and to the
discussions they joined.

#### Scenario: Question answered

- **WHEN** an ustadz answers a question
- **THEN** its asker is notified: "{ustadz} menjawab pertanyaanmu: {title}",
  linking to the answer

#### Scenario: Answer edited

- **WHEN** an answer is edited by its writer or an Admin
- **THEN** the question's asker is notified: "{ustadz} memperbarui jawaban atas
  pertanyaanmu: {title}", linking to the answer

#### Scenario: Comment on an answer to their question

- **WHEN** anyone comments on an answer to a question
- **THEN** its asker is notified: "{actor} mengomentari jawaban atas
  pertanyaanmu: {title}", linking to the answer

#### Scenario: Comment after theirs

- **WHEN** anyone comments on an answer
- **THEN** every earlier commenter on that answer is notified: "{actor} juga
  mengomentari jawaban pada: {title}", linking to the answer, except the
  answer's writer (covered under Ustadz events) and the asker (covered above)

#### Scenario: Question deleted by an Admin

- **WHEN** an Admin deletes someone else's question
- **THEN** its asker is notified: "Pertanyaanmu dihapus oleh Admin: {title}",
  linking to Ajukan Pertanyaan

#### Scenario: Role changed

- **WHEN** an Admin changes a user's role
- **THEN** that user is notified: "Peranmu kini {Ustadz | Admin | Anggota}",
  linking to their Profil

### Requirement: Ustadz events

An ustadz MUST be notified about questions addressed to them, new work in the
queue, and follow-ups under their answers.

#### Scenario: Directed question

- **WHEN** a question is asked with `directedTo` set to an ustadz
- **THEN** that ustadz is notified: "{asker} mengajukan pertanyaan untukmu:
  {title}", linking to the question

#### Scenario: New question in the queue

- **WHEN** a question is asked
- **THEN** every Guru other than the directed one is notified, linking to Jawab
  Pertanyaan
- **AND** a Guru who already has an unread new-question notification has that
  one updated instead: its count goes up by one, its text reads "{N}
  pertanyaan baru menunggu jawaban", and its time becomes now

#### Scenario: Comment on their answer

- **WHEN** anyone comments on an answer
- **THEN** the answer's writer is notified: "{actor} mengomentari jawabanmu
  pada: {title}", linking to the answer

#### Scenario: Unanswered question edited

- **WHEN** the asker edits a question that has no answers
- **THEN** the directed ustadz, or every Guru when it is not directed, is
  notified: "{asker} mengubah pertanyaan: {title}", linking to the question
- **AND** an unread edit notification for the same question is updated instead
  of adding another

### Requirement: Privacy in notifications

Notifications MUST NOT reveal more than the recipient could already see.

#### Scenario: Anonymous asker

- **WHEN** the actor is the asker of an anonymous question and the recipient is
  neither a Guru nor an Admin
- **THEN** the actor is shown as "Hamba Allah"

#### Scenario: Private answer

- **WHEN** the question is private (answered without consent to publish)
- **THEN** only recipients who may open it are notified

### Requirement: Reading notifications

A signed-in user MUST be able to list their notifications, see how many are
unread, and mark them read. Nobody else's notifications are ever visible.

#### Scenario: Listing

- **WHEN** a signed-in user requests `GET /api/notifications?page=`
- **THEN** the response is 200 with `{ items, unread, page, totalPages }`: their
  notifications newest first, 20 a page, each as `{ id, type, text, actor, link,
  count, read, createdAt }`
- **WHEN** a signed-out caller requests it
- **THEN** the response is 401

#### Scenario: Unread count

- **WHEN** a signed-in user requests `GET /api/notifications/unread-count`
- **THEN** the response is 200 with `{ unread }`

#### Scenario: Marking read

- **WHEN** the recipient posts to `POST /api/notifications/{id}/read`
- **THEN** it is marked read and the response is 204
- **WHEN** anyone else does, or the id does not exist
- **THEN** the response is 404
- **WHEN** a signed-in user posts to `POST /api/notifications/read-all`
- **THEN** all of their notifications are marked read and the response is 204

### Requirement: Notification bell

Signed-in users MUST see their notifications from every page.

#### Scenario: The bell

- **WHEN** a signed-in user views any page
- **THEN** the header shows a bell labelled "Notifikasi", with the unread count
  on it (shown as "9+" above nine) when there are unread notifications
- **AND** the count refreshes every 45 seconds while the tab is visible, and
  whenever the tab regains focus
- **AND** "Jawab Pertanyaan" keeps its own count for ustadz

#### Scenario: The dropdown

- **WHEN** they open the bell
- **THEN** a panel lists the latest 8 notifications, with unread ones marked,
  each showing its text and how long ago ("5 menit lalu", "kemarin")
- **AND** it offers "Tandai semua dibaca" and "Lihat semua", which opens
  `/notifikasi`
- **WHEN** there are none
- **THEN** it says "Belum ada notifikasi."
- **AND** the panel closes on Escape, on a click outside it, and after choosing
  a notification

#### Scenario: Opening a notification

- **WHEN** a notification is chosen, in the panel or on the Notifikasi page
- **THEN** it is marked read and the app goes to its link
- **AND** a link to an answer scrolls the question page to that answer

#### Scenario: The Notifikasi page

- **WHEN** a signed-in user opens `/notifikasi`
- **THEN** they see all their notifications, 20 a page, with pagination and
  "Tandai semua dibaca"
- **WHEN** a signed-out visitor opens it
- **THEN** they are sent to sign in

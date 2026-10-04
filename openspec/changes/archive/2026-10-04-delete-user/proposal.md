# Proposal

## Why

There is no way to remove a person. The privacy page asks people to contact the
owner to delete their data, and deleting a user row in the database also deletes
everything they wrote (a Guru's answers and the discussions under them). The site
needs a real "delete account" that removes the person but keeps their work.

## What Changes

Touches **both backend and frontend**.

- An Admin can delete any other user (Panel Admin → Pengguna, "Hapus pengguna").
  A User or Guru can delete their own account (Profil, "Hapus akun"). An Admin
  cannot delete themselves.
- Deleting **anonymizes** the account: the row stays as a marker, but name becomes
  "Hamba Allah" and email, photo, phone, address, ustadz profile and received
  notifications are removed. Role goes back to User.
- What they wrote stays, shown as "Hamba Allah" with no photo, link or gold tick:
  answers, comments, articles, ustadz posts, kajian they led, and questions that
  have an answer and may be published.
- Questions nobody else can use are deleted: unanswered ones and ones that do not
  allow publishing. Questions directed to them lose the direction.
- An old login token cannot revive a deleted account, and the same person can sign
  up again as a brand-new user.
- Deleted users disappear from Pengguna, Dewan Ustadz, every ustadz choice and the
  Panel Admin counts.
- The Kebijakan Privasi page explains it.

API changes:

| Method | Path | Auth | Response |
| --- | --- | --- | --- |
| DELETE | `/api/admin/users/{id}` | Admin | `204`; `400` for their own id; `404` unknown or already deleted (new) |
| DELETE | `/api/auth/account` | signed in, not Admin | `204`; `400` for an Admin (new) |
| GET | `/api/auth/me` | token | `{ isAuthenticated: false }` for a deleted account |
| GET | `/api/admin/users`, `/overview` | Admin | leave out deleted users |

## Capabilities

### New Capabilities

- `account-deletion`: who can delete an account, what deleting removes and keeps,
  signing in afterwards, and the privacy wording.

### Modified Capabilities

- `auth`: a token for a deleted account is signed out and creates nothing.
- `admin-users`: Pengguna leaves out deleted users.
- `admin-tools`: the Ringkasan user counts leave out deleted users.

## Impact

- Backend: `User.DeletedAt` (migration), an account-deleting routine, `AuthController`
  (`me`, `token`, the new delete), `AdminController`, `AdminContentController`,
  `GetCurrentUserAsync`.
- Frontend: `AdminUsers` ("Hapus pengguna"), `Profile` ("Hapus akun"), `Legal` (privacy
  text).
- Data: existing rows unaffected (`DeletedAt` null).

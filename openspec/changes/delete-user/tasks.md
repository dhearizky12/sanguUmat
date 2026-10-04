# Tasks

## 1. Backend

- [x] 1.1 `User.DeletedAt` (migration) and the lockout of deleted accounts: `GetCurrentUserAsync` returns null for a deleted row, `/api/auth/me` answers signed-out for a token whose Google id belongs to a deleted row (and creates nothing), and `/api/auth/token` releases a deleted row's Google id before issuing a token. Verify with test tokens: a deleted user's token gets `isAuthenticated: false` and 401 elsewhere, and signing in again through the mock creates a new account with a new id.
- [x] 1.2 `AccountDeleter.DeleteAsync` (anonymize, remove unanswered and private questions, clear direction, remove profile rows, remove received notifications, rewrite caused notifications, delete the uploaded avatar), used by `DELETE /api/admin/users/{id}` and `DELETE /api/auth/account`, with the 204/400/403/404/401 rules. Verify with test users: a user with a published answered question, a private answered question, an unanswered question, a comment and an upload is deleted, and afterwards the published question, its answers and the comment show "Hamba Allah", the private and unanswered ones are gone, the avatar file is gone, and the person is no longer in the lists; the same for a deleted Guru (answers and a post stay, no tick, no page).
- [x] 1.3 Leave deleted users out of `GET /api/admin/users` and the overview counts, and make role change and hide return 404 for them. Verify: a deleted user is not listed and not counted, and `PATCH` on them is 404; an Admin deleting themselves gets 400, a User gets 403 on the admin endpoint, and an Admin's `DELETE /api/auth/account` is 400.

## 2. Frontend

- [ ] 2.1 "Hapus pengguna" per row in Pengguna (not on the Admin's own row) and "Hapus akun" on Profil (not for Admin), with the confirmation texts, and the Kebijakan Privasi "Menghapus data" paragraph. Verify in a browser: an Admin deletes a test user and the row disappears, a User deletes their own account and lands on Masuk, an Admin sees no "Hapus akun", and the privacy page reads correctly.

## 3. Wrap-up

- [ ] 3.1 Deploy: pull and restart the API, upload the UI. Verify on the live site with a throwaway account: it posts something that gets an answer, is deleted, and the content shows "Hamba Allah" while its old token is signed out.
- [ ] 3.2 Sync the `account-deletion`, `auth`, `admin-users` and `admin-tools` deltas into `openspec/specs/` and archive the change. Verify: `openspec validate --specs` passes.

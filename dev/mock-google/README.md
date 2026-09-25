# Mock Google login (local development only)

Lets you sign in to the app locally as any seeded user without a real Google
account.

```
node dev/mock-google/server.mjs
```

Then click **Lanjut dengan Google** on `/login` as usual. Instead of Google you
get a "Masuk sebagai…" page listing the personas in `personas.json`, plus a form
for any other name and email (a new email creates a new account, like a first
Google sign-in).

## Switching back to real Google

Nothing to change in code. Any one of these does it:

- stop the mock server — `/api/auth/login` checks it on every login and falls
  back to Google when it does not answer;
- remove `DevAuth:MockGoogleUrl` from `backend/appsettings.Development.json`;
- run the backend in any environment other than Development — the mock is never
  registered there, even with the setting present.

## Personas

`personas.json` holds the users on the picker. The `sub` is the Google ID the
backend stores as `User.GoogleId`, so the seeded ones (`seed-guru-*`,
`seed-user-*`) land on the accounts from `backend/seed-dummy-data.sql`.
`admin.dev@example.com` is in the Development `AdminEmails`, so the "Admin
Pengembang" persona becomes an Admin the first time it signs in.

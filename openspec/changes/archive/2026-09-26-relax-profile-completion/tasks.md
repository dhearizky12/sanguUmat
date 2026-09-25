## 1. Backend: the completeness rule

- [x] 1.1 Add a helper that returns whether a `User` is complete — non-empty name
      and a non-empty email or phone. Verify: `dotnet build` succeeds.
- [x] 1.2 Apply it in `AuthController.Me` at account creation and for returning
      users, storing the result in `HasCompletedProfile`. No migration: the
      column already exists. Verify with the mock Google login: a new account
      reports `hasCompletedProfile: true` from `/api/auth/me`, and an existing
      account stored as `false` with a name and email comes back `true`.
- [x] 1.3 Change `CompleteProfile` to save name, phone and address as given,
      return 400 "Nama harus diisi" for an empty name, and set
      `HasCompletedProfile` from the helper. Verify with curl: an empty phone
      and address returns 200; an empty name returns 400 with that message and
      changes nothing.

- [x] 1.4 Accept an optional `returnUrl` on `GET /api/auth/login`, keep it only
      when it is a path within the app (a single leading `/`), and send the
      browser after Google to `/masuk/selesai?next=<returnUrl>` on the
      frontend. Verify with curl: `returnUrl=/questions` lands on
      `/masuk/selesai?next=/questions`; `https://evil.test` and `//evil.test`
      fall back to `next=/`.

## 2. Frontend

- [x] 2.1 Remove the incomplete-profile redirect from `Dashboard.jsx`. Verify: an
      account with `hasCompletedProfile: false` opens `/` and stays there.
- [x] 2.2 On `EditProfile`, mark phone and address "opsional", drop their
      required check, and require the name ("Nama harus diisi."). Verify in the
      browser: saving with only a name succeeds; saving with no name shows the
      message and sends nothing.
- [x] 2.4 Carry the current page into sign-in: the header's "Masuk" links, the
      Ajukan "Perlu masuk" screen and the sign-in guards send `?next=<page>` to
      `/login`, which passes it to `/api/auth/login` as `returnUrl` and uses the
      canvas's "kami kembalikan ke halaman itu" wording when there is one. Add a
      `/masuk/selesai` route that, once the session loads, goes to
      `/edit-profile?next=…` for an incomplete profile and to `next` otherwise.
      Verify with the mock login: signing in from `/questions` returns to
      `/questions`.
- [x] 2.5 After saving the profile, `EditProfile` goes to `next` when present
      instead of the home page. Verify: a new incomplete account signed in from
      `/questions` sees "Lengkapi profil", saves, and lands on `/questions`.
- [x] 2.3 Add the side column "Mengapa kami meminta data ini?" beside the form,
      stacking under it on narrow screens. Verify: screenshots at 1280px and at
      a true 400px width with no horizontal scroll.

## 3. Specs and roadmap

- [x] 3.1 Remove the complete-profile deviation from "Deferred" in
      `openspec/ROADMAP.md`, since this change resolves it. Verify:
      `openspec validate relax-profile-completion` passes.

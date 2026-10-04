# Design

## Context

Today `Program.cs` registers a cookie scheme as the default and Google as the
challenge scheme; `AuthController.Login` issues the Google challenge and `/me`
creates or updates the `User` row from the claims. Controllers find the caller
through `GetCurrentUserAsync`, which reads `ClaimTypes.NameIdentifier` (the Google
id) — so anything that puts the same claims on `User` keeps every controller and
role check working. See proposal.md for why cookies cannot be used across the two
sites.

## Goals / Non-Goals

**Goals:**
- Sign-in works from a static UI on another site in Chrome, Safari and Firefox.
- No change to controllers, roles, `AdminEmails` or the `/me` response.
- Still works when the API serves the UI itself (same origin).

**Non-Goals:**
- Refresh tokens, token revocation, or rotating keys.
- Moving to `HttpOnly` cookies via a proxy on the UI's domain.
- Other sign-in providers.

## Decisions

**Google keeps its own short-lived cookie; the app session becomes a JWT.** The
Google handler needs somewhere to park the sign-in result between the Google
callback and our code. Register a second cookie scheme (`External`) used only as
Google's `SignInScheme`. The default scheme becomes JwtBearer. The browser is on
the API's own host during the Google round trip, so this cookie is first-party.
*Alternative:* skip the cookie and validate Google's `id_token` ourselves in the
SPA (Google Identity Services). Rejected: bigger rewrite, and it drops the working
server-side OAuth flow and the dev mock.

**New `GET /api/auth/token`.** `Login` challenges Google with `RedirectUri` set to
this endpoint (carrying `next`). It authenticates the `External` scheme, issues the
JWT from those claims (NameIdentifier, Email, Name, `picture`), signs the
`External` cookie out, and redirects to
`<Frontend:BaseUrl>/masuk/selesai?next=<next>#token=<jwt>`. With no external
sign-in present it redirects to `<Frontend:BaseUrl>/login`. The `next` value keeps
today's `IsLocalPath` check.

**Token in the URL fragment.** A fragment is not sent to any server, so it stays out
of access logs and `Referer`. The SPA reads it before React renders and replaces
the history entry. *Alternative:* a one-time code exchanged by a POST. Safer in
theory, but needs server-side code storage for little gain at this scale.

**HS256, 7 days, claims only for identity.** Key from `Jwt:Key` (≥ 32 chars),
issuer and audience fixed constants, lifetime from `Jwt:ExpiryDays` (default 7).
The role is *not* in the token: the existing code reads it from the `User` row, so
role changes apply immediately and a role claim could never go stale. Startup
validates the key.

**Dev mock Google gets the same `SignInScheme`.** `DevAuth.MockGoogleScheme`
shares the `External` cookie so dev sign-in follows the identical path.

**Frontend: capture early, attach centrally.** `lib/api.js` owns the token
(`localStorage`, wrapped in try/catch), exports `captureTokenFromUrl()` called from
`main.jsx` before render, and installs a `fetch` wrapper that adds the header to
requests whose URL starts with `API_URL` (or `/api` when `API_URL` is empty) and
clears the token on a 401. This avoids editing ~35 call sites for the header; the
now-pointless `credentials: "include"` is removed from them as a cleanup.
*Alternative:* an exported `apiFetch` and replacing every `fetch(`. More explicit,
much larger diff, easy to miss one.

**CORS.** Keep the `AllowFrontend` policy with the listed origins; drop
`AllowCredentials` since nothing relies on cookies. `UseCors` already runs ahead of
authentication so preflights are answered.

**Anonymous API calls answer 401.** With JwtBearer as the challenge scheme a
protected endpoint returns 401 instead of redirecting to Google. Only
`AuthController.Login` challenges Google, by naming the scheme.

## Risks / Trade-offs

- A token in `localStorage` is readable by any script on the page → the app renders
  user HTML (`RichContent`); keep that sanitised, and keep expiry at 7 days.
- A stolen token cannot be revoked → changing `Jwt:Key` signs everyone out;
  accepted for now.
- The token passes through the browser address bar once → fragment-only, removed
  immediately; never logged.
- Funnel strips nothing but the path prefix is handled by `App__BasePath`; the
  Google redirect URI must be the Funnel URL with the prefix → documented in deploy
  README.
- Existing signed-in cookie sessions end at deploy → everyone signs in once more.

## Migration Plan

1. Deploy the API with `Jwt__Key`, `Cors__AllowedOrigins__0=https://sanguumat.web.id`,
   `Frontend__BaseUrl=https://sanguumat.web.id`, `App__BasePath=/sanguumat`.
2. In Google Cloud, set the redirect URI to
   `https://se-224.tail3f5844.ts.net/sanguumat/signin-google`.
3. Rebuild the UI with `VITE_API_URL=https://se-224.tail3f5844.ts.net/sanguumat` and
   upload `dist/`.
4. Rollback: redeploy the previous API image and UI build; no data migration is
   involved.

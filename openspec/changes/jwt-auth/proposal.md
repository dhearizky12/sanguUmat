# Proposal

## Why

The UI is now a static site on `sanguumat.web.id` and the API lives on another
site (`https://se-224.tail3f5844.ts.net/sanguumat`, a public Tailscale Funnel).
Cookie sessions across two sites are third-party cookies, which Safari and Firefox
block, so Google sign-in cannot complete for many visitors. A bearer token sent in
a header works across origins in every browser.

## What Changes

Touches **both backend and frontend**.

- The API stops using a session cookie for authentication. After the Google round
  trip it issues a signed JWT and sends the browser back to the UI with the token
  in the URL fragment: `<Frontend:BaseUrl>/masuk/selesai?next=…#token=<jwt>`.
- Every authenticated API call is made with `Authorization: Bearer <jwt>`. The
  existing controllers, roles and `AdminEmails` bootstrap are unchanged.
- The SPA captures the token before it renders, stores it in `localStorage`, strips
  it from the address bar, and adds the header to every API request from one place
  in `lib/api.js`. A `401` clears the stored token.
- Sign-out is client-side: the token is discarded. **BREAKING:** `GET /api/auth/logout`
  is removed.
- Tokens last 7 days. No refresh tokens, no early revocation.
- CORS lists the UI origin; credentials are no longer needed.
- Anonymous requests to protected endpoints now answer `401` instead of redirecting
  to Google.
- Deploy config and docs change: `JWT_KEY`, `JWT_EXPIRY_DAYS`, and the UI origin
  replace the cookie settings; the UI is built against the Funnel URL.

API changes:

| Method | Path | Auth | Response |
| --- | --- | --- | --- |
| GET | `/api/auth/login?returnUrl=` | none | Google challenge (unchanged) |
| GET | `/api/auth/token?next=` | Google sign-in just completed | 302 to the UI with `#token=` (new; reached through the Google redirect, not called by the SPA) |
| GET | `/api/auth/me` | Bearer, optional | `{ isAuthenticated, … }` (unchanged shape) |
| GET | `/api/auth/logout` | — | removed |

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `auth`: cookie session becomes a bearer token; sign-out is client-side; the JWT
  signing key becomes required configuration.

## Impact

- Backend: `Program.cs` (authentication schemes, CORS), `AuthController`, a small
  token-issuing class, `appsettings*.json`.
- Frontend: `lib/api.js` (token storage and header), `main.jsx` (capture token),
  `AuthProvider` (logout), removal of `credentials: "include"` from about 35 call
  sites.
- Deploy: `docker-compose.yml`, `.env.example`, `README.md`, `frontend/.env.production`.
- New dependency: `Microsoft.AspNetCore.Authentication.JwtBearer`.
- Security: a stolen token is usable until it expires, and an XSS bug would expose
  it from `localStorage`; the key must be a long random secret kept out of source.

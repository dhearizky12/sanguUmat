# Tasks

## 1. Backend token issuing

- [x] 1.1 Add the `Microsoft.AspNetCore.Authentication.JwtBearer` package and a `Jwt` section (`Key`, `ExpiryDays` = 7) to `appsettings.json`, with a dev-only key in `appsettings.Development.json`; startup throws `InvalidOperationException` when `Jwt:Key` is missing or under 32 characters. Verify: `dotnet build` passes and starting without the key fails with that message.
- [x] 1.2 Add a small token service that builds a signed HS256 token with NameIdentifier, Email, Name and `picture` claims and the configured expiry. Verify: a unit-style check or a debug call decodes to those claims and an `exp` 7 days out.
- [x] 1.3 In `Program.cs` make JwtBearer the default and challenge scheme, add an `External` cookie scheme, and set it as `SignInScheme` on Google and on the dev mock Google. Verify: an anonymous request to a protected endpoint returns 401 with no redirect.
- [x] 1.4 Replace the cookie `AddCookie` options (SameSite/domain handling) and update the CORS policy: listed origins, any header and method, no credentials. Verify: a preflight from the UI origin with `Authorization` is allowed; from another origin it is not.
- [x] 1.5 `AuthController`: `Login` challenges Google with `RedirectUri` pointing at the new `GET /api/auth/token?next=`; `Token` authenticates `External`, issues the JWT, signs `External` out and redirects to `<Frontend:BaseUrl>/masuk/selesai?next=…#token=…` (or to `/login` when there is no external sign-in); remove `Logout`. Verify: signing in locally through the mock lands on `/masuk/selesai#token=…` and a decoded token matches the mock user.
- [x] 1.6 Verify existing behaviour: with `Authorization: Bearer <token>` `GET /api/auth/me` returns the usual shape and creates the user on first call; with a bad or expired token it returns `{ isAuthenticated: false }`; Guru and Admin endpoints still honour roles, including a role changed after the token was issued.

## 2. Frontend token handling

- [x] 2.1 In `lib/api.js` add token storage (`localStorage`, guarded with try/catch), `captureTokenFromUrl()` and the `fetch` wrapper that adds `Authorization: Bearer` for API requests and clears the token on 401; call the capture from `main.jsx` before render. Verify: opening `/masuk/selesai#token=abc` stores the token and leaves the address bar as `/masuk/selesai?next=…`.
- [x] 2.2 `AuthProvider.logout` clears the token and goes to `/login`; remove the `/api/auth/logout` navigation. Verify: Keluar returns to Masuk and a reload stays signed out.
- [x] 2.3 Remove `credentials: "include"` from every fetch call. Verify: `grep -rn 'credentials:' frontend/src` returns nothing, `npx eslint src` is clean and `npm run build` passes.
- [ ] 2.4 Verify end to end locally with the UI and API on different origins (UI on :3000, API on :5236): sign in through the mock, reload and stay signed in, ask a question, sign out; an expired or tampered token drops back to signed-out.

## 3. Deploy config and docs

- [x] 3.1 `deploy/docker-compose.yml` and `.env.example`: add `JWT_KEY` and `JWT_EXPIRY_DAYS`, pass `Jwt__Key` / `Jwt__ExpiryDays` and `Cors__AllowedOrigins__0`, remove `COOKIE_SAMESITE` and `COOKIE_DOMAIN`, set the prefix and public URL examples for `/sanguumat` and `https://sanguumat.web.id`. Verify: `docker compose config` renders without warnings.
- [x] 3.2 Set `frontend/.env.production` to `VITE_API_URL=https://se-224.tail3f5844.ts.net/sanguumat`; rewrite the "different origins" section of `deploy/README.md` for the token flow, the Google redirect URI and the key. Verify: README steps match the compose file names.
- [ ] 3.3 Sync the `auth` spec into `openspec/specs/` and archive this change; tick it in `ROADMAP.md`. Verify: `openspec validate` passes.

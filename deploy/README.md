# Deployment

Two parts, deployed separately:

| Part | Where |
| --- | --- |
| UI (React build) | Static hosting (Hostinger) at `https://sanguumat.web.id` |
| API + Postgres | Docker on a machine you control (`deploy/docker-compose.yml`) |

The API image also contains the UI and can serve it from its own origin, which is
handy for trying the whole thing on one machine. The public site is the static build.

---

## 1. UI on Hostinger (static files)

```bash
cd frontend
# frontend/.env.production: VITE_API_URL=<the API's public origin, no trailing slash>
npm ci
npm run build
```

Upload everything inside `frontend/dist/` to the site's `public_html/` (File
Manager or FTP). `dist/.htaccess` comes from `frontend/public/` and sends every
route (`/questions`, `/articles/12`, …) to `index.html`, so refreshes and shared
links work. Keep it in the upload; it is a dotfile and easy to miss.

`VITE_API_URL` is baked into the bundle at build time, so rebuild and re-upload
when the API address changes. Until an API is reachable at that address the pages
load but show no data and sign-in does not work.

## 2. API and database

```bash
cd deploy
cp .env.example .env       # fill in every CHANGE_ME / YOUR_
docker compose up -d --build
```

The API applies EF migrations on boot, so a fresh database sets itself up. It
listens on `127.0.0.1:8080` (change with `API_HOST_PORT`); put a reverse proxy in
front of that port to reach it from outside.

Needed in `.env`: `POSTGRES_PASSWORD`, a Google OAuth client
(`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, from console.cloud.google.com → APIs
& Services → Credentials), `PUBLIC_BASE_URL` (`https://sanguumat.web.id`) and
`ADMIN_EMAIL` (the Google account that becomes Admin on its first sign-in; set it
before that account has ever signed in). The Google authorized redirect URI is
`<API public origin>/signin-google`.

### UI and API on different origins

The UI is on `sanguumat.web.id`, so the API sits on another origin and the sign-in
cookie has to cross it. The simplest working setup is the API on a subdomain of
the same site, `https://api.sanguumat.web.id`:

- `VITE_API_URL=https://api.sanguumat.web.id` when building the UI.
- `COOKIE_DOMAIN=.sanguumat.web.id`, so the cookie is shared by both hosts.
- `COOKIE_SAMESITE=Lax` stays correct: both hosts are the same site.
- `EXTRA_CORS_ORIGIN=https://sanguumat.web.id`. The API already allows credentials
  for listed origins.

On an unrelated domain the cookie would be third-party, which Firefox and Safari
block by default, so sign-in fails there.

## 3. What is persisted — `deploy/data/`

Everything the stack owns is bind-mounted under `deploy/data/`:

- `postgres/` — the database
- `uploads/` — avatars and article covers
- `dp-keys/` — the key ring that signs the login cookie; losing it logs everyone out

`docker compose down -v` does **not** erase `data/`; to wipe, delete the folder.

## 4. Common commands

```bash
docker compose logs -f api                  # follow API logs
docker compose up -d --build                # rebuild and restart after a code change
docker compose exec db psql -U sanguumat -d sanguumat

# backup / restore
docker compose exec -T db pg_dump -U sanguumat sanguumat > backup.sql
docker compose exec -T db psql -U sanguumat -d sanguumat < backup.sql
```

Back up the database dump together with `data/uploads/`.

## 5. Local development

Run Postgres from `docker compose up -d db`, then the API with `dotnet watch run`
in `backend/` and the UI with `npm run dev` in `frontend/` (it talks to
`http://localhost:5236` via `frontend/.env.development`).

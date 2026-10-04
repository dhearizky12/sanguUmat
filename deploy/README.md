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
docker compose up -d db    # Postgres
./run-api.sh               # the API, on 127.0.0.1:5236 (or `docker compose up -d --build` for the API in Docker, on 127.0.0.1:8080)
```

The API applies EF migrations on boot, so a fresh database sets itself up. Put a
reverse proxy in front of its port to reach it from outside. It must keep the path
prefix (`/sanguumat`) and set `X-Forwarded-Proto: https`; the API strips the prefix
itself (`APP_BASE_PATH`).

Needed in `.env`:

- `POSTGRES_PASSWORD`.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` from console.cloud.google.com → APIs &
  Services → Credentials. The authorized redirect URI is
  `<API public origin><APP_BASE_PATH>/signin-google`, for example
  `https://se-224.tail3f5844.ts.net/sanguumat/signin-google`.
- `JWT_KEY`: at least 32 random characters (`openssl rand -base64 48`). It signs the
  login token; changing it signs everyone out. The API refuses to start without it.
- `PUBLIC_BASE_URL`: where the UI lives (`https://sanguumat.web.id`).
- `EXTRA_CORS_ORIGIN`: the same UI origin, so the browser may call the API.
- `ADMIN_EMAIL`: the Google account that becomes Admin on its first sign-in; set it
  before that account has ever signed in.

### How sign-in works across the two sites

The UI (`sanguumat.web.id`) and the API (`se-224.tail3f5844.ts.net`) are different
sites, so there is no shared cookie. Instead:

1. The UI sends the browser to `<API>/api/auth/login`, which goes to Google.
2. Google returns to `<API>/signin-google`; the API turns that into a signed token and
   redirects to `https://sanguumat.web.id/masuk/selesai#token=…`.
3. The UI stores the token, removes it from the address bar, and sends it as
   `Authorization: Bearer …` on every API call. Tokens last 7 days (`JWT_EXPIRY_DAYS`);
   after that the visitor signs in again. Signing out just discards the token.

Build the UI with `VITE_API_URL` set to the API origin plus prefix
(`frontend/.env.production`), then upload `dist/` again whenever it changes.

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

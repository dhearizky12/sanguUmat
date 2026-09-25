# Deployment

Everything runs on one machine, in Docker, published to the internet with
**Tailscale Funnel**:

| Part | Where |
| --- | --- |
| Postgres | `db` container |
| API + React SPA | `api` container — one image, one origin |
| Public access | `tailscale funnel` on the host, at `https://<machine>.<tailnet>.ts.net` |

There is **no separate frontend hosting**. The Docker build compiles the SPA and
drops `dist/` into the API's `wwwroot`, so the API serves both the bundle and
`/api/...` from the same origin. That is the whole point: the auth cookie is
first-party, so it works in Firefox and Safari too, `SameSite=Lax` is enough, and
CORS never enters the picture.

Nothing is port-forwarded on the router — `db` and `api` publish to `127.0.0.1`
only, and Funnel picks the API up from that loopback port.

Unlike the ngrok setup this replaced: no authtoken in `.env`, no browser
interstitial page on first visit, and the hostname is fixed for good — it is
derived from the machine name and the tailnet, not handed out per session.

---

## 1. Prerequisites

- Docker with the compose plugin.
- Tailscale installed on this machine and logged in (`tailscale status` shows it
  online).
- Two tailnet-wide settings, both one-time, in the admin console at
  login.tailscale.com:
  - **DNS → HTTPS Certificates → Enable.** Funnel serves a real Let's Encrypt
    cert for `*.ts.net`, and this is what allows it.
  - **Access controls → the `funnel` node attribute.** If it is missing, the
    first `tailscale funnel` command fails and prints a link that adds it for
    you. Done by hand it looks like:

    ```jsonc
    "nodeAttrs": [
      { "target": ["autogroup:member"], "attr": ["funnel"] },
    ]
    ```
- A Google OAuth client (console.cloud.google.com → APIs & Services →
  Credentials).

## 2. Configure

```bash
cd deploy
cp .env.example .env       # fill in every CHANGE_ME / REPLACE-WITH
```

The one that matters most is the public URL — your machine's MagicDNS name:

```bash
tailscale status --json | grep -E '"(DNSName|MagicDNSSuffix)"'
```

```
PUBLIC_BASE_URL=https://se-224.tail3f5844.ts.net   # no trailing slash
```

Then in the Google Cloud Console, add the authorized redirect URI:

```
https://se-224.tail3f5844.ts.net/signin-google
```

(Authorized *redirect URI*, not authorized JavaScript origin. It is the API that
completes the OAuth exchange, not the browser.)

## 3. Run

```bash
docker compose up -d --build
docker compose logs -f api
```

> **Superseded on this machine.** The funnel no longer points at 8080 directly.
> Caddy owns port 80 and this app is mounted under a path prefix behind it, so
> `tailscale funnel --bg 80` is the (one-time) funnel command and Caddy does the
> routing. See section 9. The rest of this section still describes the
> prerequisites correctly.

The first build takes a few minutes — it compiles the SPA with Node and the API
with the .NET SDK. The API applies EF migrations on boot, so a fresh database
gets its schema by itself.

The funnel is a one-time setup, not something to re-run per deploy: `--bg` stores
the config in tailscaled's state, so it survives `docker compose down`, a
tailscaled restart and a reboot. Rebuilding the containers does not touch it.

Nothing here is tied to a desktop session either — `tailscaled` and `docker` are
both system services, so logging out (or never logging in) changes nothing. The
host only has to be powered on and online. On a laptop that also means keeping it
from suspending: `HandleLidSwitch=ignore` and `IdleAction=ignore` in
`/etc/systemd/logind.conf`.

**Disable key expiry on the serving machine.** Tailscale node keys expire (180
days by default). When one does, the machine drops off the tailnet and the funnel
goes dark until somebody re-authenticates *at the keyboard* — which is the worst
possible failure for an unattended deployment, and it gives no warning in the app.
Admin console → Machines → the machine → `⋯` → Disable key expiry. Check the
current state with:

```bash
tailscale status --json | grep -E '"(KeyExpiry|Expired)"'
```

Check it:

```bash
curl http://localhost:8080/healthz                     # OK — the API itself
tailscale funnel status                                # the public URL + target
curl -I https://se-224.tail3f5844.ts.net               # 200 — through the funnel
```

Then open `https://se-224.tail3f5844.ts.net` in a browser, from any network — no
Tailscale client needed on the visitor's side. That is the difference between
`funnel` and plain `serve`: `serve` would publish the same thing to tailnet
members only.

Two Funnel limits worth knowing:

- The public side can only listen on **443, 8443 or 10000**. `--bg 8080` means
  "public 443 → local 8080", which is what you want; if you ever need a second
  service, it goes on `--https=8443`.
- Ingress is relayed through Tailscale's infrastructure, so throughput and
  latency are worse than a direct connection. Fine for this app; not a CDN.

To take it down or point it somewhere else:

```bash
sudo tailscale funnel --bg off       # stop publishing
sudo tailscale funnel status         # confirm
```

To stop needing `sudo` for these:

```bash
sudo tailscale set --operator=$USER  # once; then `tailscale funnel ...` plain
```

## 4. What is persisted — `deploy/data/`

Everything the stack owns is bind-mounted into one folder, gitignored:

```
deploy/data/postgres/   the database
deploy/data/uploads/    profile pictures
deploy/data/dp-keys/    Data Protection key ring
```

`dp-keys` encrypts the auth cookie. Cookie auth always generates one; the app has
no code for it, it just lands in the framework default
`$HOME/.aspnet/DataProtection-Keys` and the mount is what keeps it across
rebuilds. Delete it and every user is logged out. `HOME` is pinned to `/root` in
the Dockerfile so that path cannot drift.

Back up this folder and you have backed up the whole deployment.

Two things to know about bind mounts:

- **`docker compose down -v` does NOT erase `data/`.** Named volumes would have
  been removed; a bind mount is just a folder. To wipe, delete it yourself.
- `data/postgres` is owned by the container's postgres user (uid 70) and is not
  readable from your shell without `sudo`. That is normal — go through
  `docker compose exec` instead of poking at the files.

## 5. Common commands

```bash
docker compose up -d --build            # rebuild + restart after a code change
docker compose logs -f api              # tail API logs
docker compose ps                       # what is running
docker compose down                     # stop; data/ and the funnel survive

tailscale funnel status                 # is it published, and to what
sudo journalctl -u tailscaled -f        # tunnel-side logs

# psql into the running database
docker compose exec db psql -U sanguumat -d sanguumat

# backup / restore
docker compose exec -T db pg_dump -U sanguumat sanguumat > backup.sql
docker compose exec -T db psql -U sanguumat -d sanguumat < backup.sql

# start clean (destroys the database, uploads and every session)
docker compose down && sudo rm -rf data/ && mkdir -p data
```

A frontend change needs a rebuild — the bundle lives inside the image:

```bash
docker compose up -d --build api
```

## 6. Running Tailscale in a container instead

The funnel lives on the host because Tailscale is already installed and logged in
there. If you would rather have the whole stack self-contained — a different
machine, no host daemon — add a sidecar that joins the tailnet as its own node and
reaches the API over the compose network:

```yaml
  tailscale:
    image: tailscale/tailscale:latest
    restart: unless-stopped
    depends_on: [api]
    environment:
      TS_AUTHKEY: ${TS_AUTHKEY}          # login.tailscale.com > Settings > Keys
      TS_HOSTNAME: sangu-umat            # decides the public hostname
      TS_STATE_DIR: /var/lib/tailscale   # must persist, or you get a new node each boot
      TS_SERVE_CONFIG: /config/funnel.json
      TS_USERSPACE: "true"
    volumes:
      - ./data/tailscale:/var/lib/tailscale
      - ./funnel.json:/config/funnel.json:ro
```

with `funnel.json`:

```json
{
  "TCP": { "443": { "HTTPS": true } },
  "Web": {
    "${TS_CERT_DOMAIN}:443": {
      "Handlers": { "/": { "Proxy": "http://api:8080" } }
    }
  },
  "AllowFunnel": { "${TS_CERT_DOMAIN}:443": true }
}
```

It becomes a *second* node, so the hostname changes (`sangu-umat.<tailnet>.ts.net`)
and `PUBLIC_BASE_URL` plus the Google redirect URI have to follow. The host-level
funnel is one command and no auth key, which is why it is the default here.

## 7. Local development is unchanged

The single-origin setup only applies to the built bundle. For day-to-day work:

```bash
cd backend  && dotnet run     # http://localhost:5236
cd frontend && npm run dev    # http://localhost:3000
```

`frontend/.env.development` points `VITE_API_URL` at `http://localhost:5236`, and
the backend's `appsettings.json` allows `http://localhost:3000` through CORS. The
SPA fallback route only activates when a built `index.html` is actually present in
`wwwroot`, so `dotnet run` keeps returning real 404s for unknown paths.

To point a local `npm run dev` at the *deployed* API instead, set
`EXTRA_CORS_ORIGIN=http://localhost:3000` in `deploy/.env`, restart the api
container, and put the `.ts.net` URL in `frontend/.env.local`. Login will not work
that way, though — the cookie is `SameSite=Lax` and localhost is a different
origin.

## 7b. Live dev on the public URL (no Docker for the app)

The Docker stack above serves a *built* bundle: every change needs
`docker compose up -d --build`. For iterating while still being reachable at the
public URL — showing work to someone, or testing Google login, which cannot run
against `localhost` — run both servers on the host instead and let Caddy proxy
them. Only Postgres stays in Docker.

```bash
cd deploy && docker compose up -d db          # 127.0.0.1:5433, that service only

# tmux session "sanguumat", one window each:
cd backend  && dotnet watch run --launch-profile public   # 127.0.0.1:5236
cd frontend && npm run dev:public                         # [::1]:3000
```

Live, with hot reload, at **https://se-224.tail3f5844.ts.net/sanguumat/**.

Same prefix and same `Frontend__BaseUrl` as the Docker deployment, so the Google
authorized redirect URI (`<PUBLIC_BASE_URL>/signin-google`) is unchanged — you can
switch between the two modes without touching the Google console.

The four pieces that make a dev server work behind a path — all needed:

1. `--base=/sanguumat/` — Vite emits asset URLs under the prefix.
2. `devBaseHref()` in `vite.config.js` — rewrites `<base href>`, which Vite itself
   does not, so `basePath.js` and React Router see the prefix. In the Docker setup
   the API does this rewrite instead (see section 9).
3. `PUBLIC_HMR=1` — points the HMR websocket at 443/wss instead of this server's
   unexposed port 3000.
4. `VITE_API_URL=` (empty) — neutralises `.env.development`'s `localhost:5236`, so
   `api.js` falls back to `BASE_PATH` and every request stays on the funnel
   origin. Same-origin means the auth cookie is first-party and no CORS is needed,
   exactly as in production.

Items 1, 3 and 4 are what the `dev:public` script sets.

`App__BasePath` and `Frontend__BaseUrl` come from the `public` launch profile in
`backend/Properties/launchSettings.json`.

Caddy routes the prefix to two upstreams rather than one — see
`~/Desktop/caddy/apps/10-sanguumat.caddy`. `/sanguumat/api/*`,
`/sanguumat/signin-google*`, `/sanguumat/uploads/*` and `/sanguumat/healthz` go
to `dotnet watch`; everything else under the prefix goes to Vite, which owns the
SPA fallback. `handle` blocks are evaluated in order, so the backend routes must
be claimed first or Vite answers them with `index.html`.

To go back to the Docker stack: stop both dev servers, point every
`reverse_proxy` in that file at `127.0.0.1:8080`, `caddy-apply`, and
`docker compose up -d --build`.

## 8. If the public hostname ever changes

It only changes if you rename the machine in the admin console (or move to the
container sidecar above). Three places have to agree — miss one and login breaks:

1. Google Cloud Console → Credentials → authorized redirect URI:
   `https://<new-host>.<tailnet>.ts.net/signin-google`
2. `deploy/.env` → `PUBLIC_BASE_URL`
3. `docker compose up -d` (no rebuild needed — it is an env var, not baked in)

`frontend/.env.production` is deliberately empty and does *not* need touching —
the bundle uses relative URLs, so it follows whatever domain serves it.

---

## 9. Mounted under a path prefix, behind Caddy

On `se-224` this app no longer owns the funnel root. The chain is:

```
https://se-224.tail3f5844.ts.net/sanguumat/
        │
        ├─ Tailscale Funnel   443 -> 127.0.0.1:80   (terminates TLS)
        ├─ Caddy              ~/Desktop/caddy/apps/10-sanguumat.caddy
        └─ api container      127.0.0.1:8080
```

The prefix is a **runtime setting, not a build input** — the same image serves any
prefix. Three pieces make that work:

| Piece | Role |
| --- | --- |
| `App__BasePath` (`APP_BASE_PATH`) | `UsePathBase` strips the prefix and records it as `Request.PathBase`, so controller routes stay prefix-free and generated URLs get the prefix back. |
| `vite.config.js` `base: "./"` | Every asset URL in the bundle is relative, so it carries no assumption about the mount path. |
| `<base href>` injected into `index.html` | The API rewrites it per `App__BasePath` when it serves the SPA fallback. The browser resolves the relative asset URLs against it; `frontend/src/lib/basePath.js` reads it back for React Router's `basename` and for the API URL prefix. |

### Moving it to a different prefix

```bash
# 1. deploy/.env — these two must agree
APP_BASE_PATH=/newpath
PUBLIC_BASE_URL=https://se-224.tail3f5844.ts.net/newpath

# 2. the Caddy route
sed -i 's|/sanguumat|/newpath|g' ~/Desktop/caddy/apps/10-sanguumat.caddy
~/Desktop/caddy/bin/caddy-apply

# 3. restart — note: no --build
docker compose up -d
```

Then add `https://se-224.tail3f5844.ts.net/newpath/signin-google` to the
authorized redirect URIs in Google Cloud Console. **This is the one step that is
not config** — Google will not accept a `redirect_uri` that is not registered, and
login fails with `redirect_uri_mismatch` until it is. Registering both the old and
new URI up front makes the switch itself config-only.

To move it back to the root, set `APP_BASE_PATH=` empty, drop the prefix from
`PUBLIC_BASE_URL`, and replace the Caddy `handle /sanguumat*` block with a bare
`handle`.

### Two ordering traps

- **`UsePathBase` must precede `UseRouting`.** `WebApplication` inserts
  `UseRouting` at the very top of the pipeline when you do not call it explicitly,
  which puts route matching ahead of the prefix stripping. The symptom is nasty:
  every `/api/...` route 404s while the SPA fallback answers `200` with HTML, so
  `curl -o /dev/null -w '%{http_code}'` looks fine and only the body reveals it.
  `Program.cs` therefore calls `UseRouting()` explicitly, after `UsePathBase`.
- **Caddy must use `handle`, not `handle_path`.** `handle_path` strips the prefix
  before proxying, and the app would then generate root-relative URLs — including
  the Google `redirect_uri`. The app strips the prefix itself.

### Why Caddy forces `X-Forwarded-Proto: https`

Funnel terminates TLS and speaks plain HTTP to Caddy on port 80, so the scheme
Caddy sees is `http` and that is what it would pass on. The app derives the OAuth
`redirect_uri` and the `Secure` cookie decision from that header, so the Caddy
block sets it to `https` explicitly — which is what the public origin really is.

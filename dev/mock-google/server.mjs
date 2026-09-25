// A stand-in for Google's OAuth server, for local development only.
//
// The backend's /api/auth/login sends the browser here instead of accounts.google.com
// whenever this server answers /healthz and DevAuth:MockGoogleUrl is configured (see
// backend/Program.cs). Stop this process and login goes back to real Google — no code
// change on either side.
//
// It speaks just enough of the OAuth 2.0 authorization-code flow for ASP.NET's Google
// handler: an authorize page that lets you pick who to sign in as, a token endpoint and
// a userinfo endpoint. Nothing here is secure, and it is never deployed.
//
//   node dev/mock-google/server.mjs          (port 5299, or MOCK_GOOGLE_PORT)
//
// Personas come from personas.json next to this file; the seeded users there match
// backend/seed-dummy-data.sql, so signing in as one lands on that existing account.

import { createServer } from "node:http";
import { readFileSync } from "node:fs";

const PORT = Number(process.env.MOCK_GOOGLE_PORT ?? 5299);
const personas = JSON.parse(readFileSync(new URL("./personas.json", import.meta.url), "utf8"));

// The authorization code and the access token are both just the chosen profile,
// base64url-encoded. There is nothing to protect in a local mock.
const encode = (profile) => Buffer.from(JSON.stringify(profile)).toString("base64url");
const decode = (token) => JSON.parse(Buffer.from(token, "base64url").toString("utf8"));

const escapeHtml = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function userinfo(profile) {
  const [given, ...rest] = profile.name.split(" ");
  return {
    sub: profile.sub,
    id: profile.sub,
    name: profile.name,
    given_name: given,
    family_name: rest.join(" "),
    email: profile.email,
    email_verified: true,
    picture: profile.picture ?? null,
  };
}

function authorizePage(params) {
  const hidden = ["redirect_uri", "state"]
    .map((k) => `<input type="hidden" name="${k}" value="${escapeHtml(params.get(k))}">`)
    .join("");
  const rows = personas
    .map(
      (p) => `
      <form method="post" action="/choose">${hidden}
        <input type="hidden" name="sub" value="${escapeHtml(p.sub)}">
        <input type="hidden" name="name" value="${escapeHtml(p.name)}">
        <input type="hidden" name="email" value="${escapeHtml(p.email)}">
        <button><strong>${escapeHtml(p.name)}</strong><span>${escapeHtml(p.email)} · ${escapeHtml(p.note ?? "")}</span></button>
      </form>`,
    )
    .join("");
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mock Google — Sangu Umat</title>
<style>
  body{margin:0;font:16px/1.5 Georgia,serif;background:#fbfaf5;color:#17201c}
  main{max-width:460px;margin:0 auto;padding:40px 18px}
  .tag{font:11px/1 ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:#a2452e;background:#f8ece9;border:1px solid #e2bcae;display:inline-block;padding:6px 8px}
  h1{font-weight:400;font-size:30px;margin:14px 0 6px}
  p{color:#565d54;margin:0 0 22px}
  form{margin:0}
  button{all:unset;box-sizing:border-box;display:flex;flex-direction:column;gap:2px;width:100%;padding:14px 16px;border:1px solid #c6bfac;border-top-width:0;background:#fffdf7;cursor:pointer}
  form:first-of-type button{border-top-width:1px}
  button:hover{background:#f2eee2}
  button span{font:12px ui-monospace,monospace;color:#6b7269}
  fieldset{border:1px solid #c6bfac;margin:26px 0 0;padding:16px;display:flex;flex-direction:column;gap:10px}
  legend{font:11px ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;padding:0 6px}
  input[type=text],input[type=email]{font:inherit;padding:10px 12px;border:1px solid #c6bfac;background:#fffdf7}
  .go{all:unset;text-align:center;background:#0c4a38;color:#f7f3e8;padding:12px;font:11px ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;cursor:pointer}
</style></head><body><main>
  <span class="tag">Mock login · hanya untuk pengembangan</span>
  <h1>Masuk sebagai…</h1>
  <p>Server ini menggantikan Google selama pengembangan lokal. Hentikan prosesnya untuk kembali ke login Google.</p>
  ${rows}
  <form method="post" action="/choose">${hidden}
    <fieldset><legend>Akun baru / lainnya</legend>
      <input type="text" name="name" placeholder="Nama" required>
      <input type="email" name="email" placeholder="Email" required>
      <input type="text" name="sub" placeholder="ID Google (kosongkan untuk dibuat dari email)">
      <button class="go">Masuk</button>
    </fieldset>
  </form>
</main></body></html>`;
}

async function readForm(req) {
  let body = "";
  for await (const chunk of req) body += chunk;
  return new URLSearchParams(body);
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  try {
    if (url.pathname === "/healthz") {
      res.writeHead(200, { "content-type": "text/plain" }).end("OK");
      return;
    }

    // Google's authorization endpoint: show the persona picker.
    if (req.method === "GET" && url.pathname === "/o/oauth2/v2/auth") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(authorizePage(url.searchParams));
      return;
    }

    // The picker posts here; send the browser back to the app with a "code".
    if (req.method === "POST" && url.pathname === "/choose") {
      const form = await readForm(req);
      const email = form.get("email")?.trim();
      const profile = {
        sub: form.get("sub")?.trim() || `mock-${email}`,
        name: form.get("name")?.trim() || email,
        email,
      };
      const back = new URL(form.get("redirect_uri"));
      back.searchParams.set("code", encode(profile));
      back.searchParams.set("state", form.get("state") ?? "");
      res.writeHead(302, { location: back.toString() }).end();
      return;
    }

    // Token endpoint: the backend swaps the code for an access token (server to server).
    if (req.method === "POST" && url.pathname === "/token") {
      const form = await readForm(req);
      const code = form.get("code");
      decode(code); // reject garbage early
      res
        .writeHead(200, { "content-type": "application/json" })
        .end(JSON.stringify({ access_token: code, token_type: "Bearer", expires_in: 3600 }));
      return;
    }

    // Userinfo endpoint: the backend reads the profile with that token.
    if (req.method === "GET" && url.pathname === "/userinfo") {
      const token = (req.headers.authorization ?? "").replace(/^Bearer\s+/i, "");
      res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(userinfo(decode(token))));
      return;
    }

    res.writeHead(404).end();
  } catch (err) {
    console.error(err);
    res.writeHead(400, { "content-type": "text/plain" }).end("Bad request");
  }
}).listen(PORT, () => {
  console.log(`Mock Google login on http://localhost:${PORT} — stop it to use real Google again.`);
});

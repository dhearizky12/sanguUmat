import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'

/**
 * Dev only: put the resolved Vite `base` into <base href>.
 *
 * index.html ships `<base href="/" />` and expects the serving layer to rewrite
 * it — in production that is the API, which injects it from App__BasePath (see
 * backend/Program.cs). In development Vite *is* the serving layer, and it
 * rewrites asset URLs for `base` but leaves <base href> alone. Without this,
 * `vite --base=/sanguumat/` behind Caddy loads every asset correctly and then
 * breaks everything else, because src/lib/basePath.js still reads "/" — so
 * React Router's basename stays empty and API_URL loses the prefix.
 *
 * apply: 'serve' matters — on a build `base` is './', and writing that into
 * <base href> would defeat the API's request-time rewrite.
 */
function devBaseHref() {
  return {
    name: 'dev-base-href',
    apply: 'serve',
    transformIndexHtml(html, ctx) {
      const base = ctx.server?.config.base ?? '/';
      return html.replace(/<base\s+href="[^"]*"\s*\/?>/, `<base href="${base}" />`);
    },
  };
}

/**
 * Dev only: send `/sanguumat` to `/sanguumat/`.
 *
 * Vite's own base middleware answers the base-without-its-trailing-slash with a
 * 404 page containing a link — "did you mean to visit /sanguumat/ instead?" —
 * rather than a redirect. Typing the prefix without the slash is the normal way
 * to reach a mounted app, so it should just load.
 *
 * This runs from `configureServer` directly (not the returned post-hook) because
 * those hooks are installed before Vite's internal middlewares; the post-hook
 * would run after the base middleware has already answered.
 *
 * 302, not 301: browsers cache a permanent redirect per origin, so a later run
 * with a different base would keep bouncing to the old one.
 */
function devBaseRedirect() {
  return {
    name: 'dev-base-redirect',
    apply: 'serve',
    configureServer(server) {
      // config.base is normalised to end in "/"; "/" means unmounted.
      const base = server.config.base;
      if (base === '/') return;
      const bare = base.slice(0, -1);

      server.middlewares.use((req, res, next) => {
        const url = req.url ?? '/';
        const q = url.indexOf('?');
        const pathname = q === -1 ? url : url.slice(0, q);
        if (pathname !== bare) return next();

        res.writeHead(302, { Location: base + (q === -1 ? '' : url.slice(q)) });
        res.end();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  // Relative asset URLs ("./assets/x.js") instead of absolute ("/assets/x.js"),
  // so the bundle carries no assumption about where it is mounted. The browser
  // resolves them against the <base href> the API injects. This is what lets the
  // mount path be a config value rather than a rebuild.
  //
  // Overridden per-run in development by `--base=/sanguumat/` (npm run
  // dev:public), which is what devBaseHref above then writes into <base href>.
  base: "./",
  server: {
    port: 3000,
    // Loud failure instead of a silent hop to 3001: Caddy proxies a fixed port,
    // and a moved dev server shows up as a 502 with no obvious cause.
    strictPort: true,

    /**
     * PUBLIC_HMR=1 is for serving this dev server through Caddy + Tailscale
     * Funnel at https://se-224.tail3f5844.ts.net/sanguumat/.
     *
     * The HMR client derives its websocket URL from the page it is on but
     * defaults the port to this server's own (3000), which is not exposed
     * publicly. Pointing it at 443/wss makes it dial the funnel instead, so hot
     * reload survives the proxy. Left off for plain local dev, where
     * wss://localhost:443 would be wrong.
     */
    ...(process.env.PUBLIC_HMR === '1'
      ? { hmr: { protocol: 'wss', clientPort: 443 } }
      : {}),
  },
  plugins: [
    react(),
    tailwindcss(),
    devBaseHref(),
    devBaseRedirect(),
  ],
});

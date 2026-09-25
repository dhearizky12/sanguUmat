// The URL path prefix this SPA is mounted under — "/sanguumat" for example, or
// "" when it sits at the domain root.
//
// This is deliberately NOT a build-time constant. The API injects
// `<base href="...">` into index.html from its App__BasePath setting, and Vite is
// configured with `base: "./"` so every asset URL in the bundle is relative. The
// result: the same built image can be remounted under a different path by
// changing config and restarting — no `--build`.
const href = document.querySelector("base")?.getAttribute("href") ?? "/";

// Normalise to either "" or "/prefix" (no trailing slash), which is what both
// React Router's basename and string-concatenated API URLs want.
export const BASE_PATH = new URL(href, window.location.origin)
  .pathname
  .replace(/\/+$/, "");

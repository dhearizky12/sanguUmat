import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset URLs ("./assets/x.js") instead of absolute ("/assets/x.js"),
  // so the bundle carries no assumption about where it is mounted. The browser
  // resolves them against <base href> in index.html ("/" on static hosting; the
  // API rewrites it when it serves the bundle under a path prefix).
  base: "./",
  server: {
    port: 3000,
    // Loud failure instead of a silent hop to 3001: a moved dev server
    // would leave the backend's CORS origin pointing at the wrong port.
    strictPort: true,
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
});

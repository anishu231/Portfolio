import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// /api and /media are proxied to Django, so the browser sees ONE origin.
// This keeps session + CSRF cookies simple (same as production rewrites).
const backend = "http://127.0.0.1:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
  "/backend": {
    target: backend,
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/backend/, "/api"),
  },
  "/media": { target: backend, changeOrigin: true },
},
  },
});

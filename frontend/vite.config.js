import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backend = "http://127.0.0.1:8000";

// Local dev only: the browser calls /api/backend?path=profile/ (same as production),
// and this proxy turns it into Django's /api/profile/.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api/backend": {
        target: backend,
        changeOrigin: true,
        rewrite: (path) => {
          const u = new URL(path, "http://x");
          const p = u.searchParams.get("path") || "";
          u.searchParams.delete("path");
          const qs = u.searchParams.toString();
          return `/api/${p}${qs ? "?" + qs : ""}`;
        },
      },
      "/media": { target: backend, changeOrigin: true },
    },
  },
});
proxy: {
  "/api/backend": {
    target: backend,
    changeOrigin: true,
    bypass: undefined,
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
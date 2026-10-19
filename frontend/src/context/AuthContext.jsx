import { createContext, useContext, useEffect, useState } from "react";
import { api, ensureCsrf } from "../lib/api";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/admin/auth/me/")
      .then((d) => setUser(d.authenticated ? d.user : null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    const expired = () => setUser(null);
    window.addEventListener("auth-expired", expired);
    return () => window.removeEventListener("auth-expired", expired);
  }, []);

  async function login(username, password) {
    await ensureCsrf();
    setUser(await api.post("/api/admin/auth/login/", { username, password }));
  }

  async function logout() {
    try { await api.post("/api/admin/auth/logout/"); } finally { setUser(null); }
  }

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
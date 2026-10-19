import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const Ctx = createContext(null);

export function ThemeProvider({ children }) {
  const { pathname } = useLocation();
  const [pref, setPref] = useState(() => {
    try { return localStorage.getItem("theme"); } catch { return null; }
  });
  const [defaultTheme, setDefaultTheme] = useState("dark");
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const h = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  const choice = pref || defaultTheme;
  const resolved = choice === "system" ? (systemDark ? "dark" : "light") : choice;
  const effective = pathname.startsWith("/admin-panel") ? "dark" : resolved; // admin is always dark

  useEffect(() => {
    document.documentElement.classList.toggle("dark", effective === "dark");
    document.documentElement.style.colorScheme = effective;
  }, [effective]);

  const value = useMemo(
    () => ({
      theme: effective,
      setDefaultTheme,
      toggle() {
        const next = resolved === "dark" ? "light" : "dark";
        setPref(next);
        try { localStorage.setItem("theme", next); } catch { /* storage blocked */ }
      },
    }),
    [effective, resolved]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
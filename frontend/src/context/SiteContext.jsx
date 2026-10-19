import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useTheme } from "./ThemeContext";

const Ctx = createContext(null);

export function SiteProvider({ children }) {
  const { setDefaultTheme } = useTheme();
  const [state, setState] = useState({ loading: true, error: null, profile: null, settings: null, resume: null });

  useEffect(() => {
    let off = false;
    Promise.all([api.get("/api/profile/"), api.get("/api/settings/"), api.get("/api/resume/")])
      .then(([profile, settings, resume]) => {
        if (!off) setState({ loading: false, error: null, profile, settings, resume });
      })
      .catch((error) => {
        if (!off) setState((s) => ({ ...s, loading: false, error }));
      });
    return () => { off = true; };
  }, []);

  useEffect(() => {
    if (state.settings?.default_theme) setDefaultTheme(state.settings.default_theme);
  }, [state.settings, setDefaultTheme]);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export const useSite = () => useContext(Ctx);
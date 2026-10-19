import { useState } from "react";
import { Link } from "react-router-dom";
import { useSite } from "../../context/SiteContext";
import { useTheme } from "../../context/ThemeContext";

const LINKS = [
  ["about", "About"], ["skills", "Skills"], ["projects", "Projects"],
  ["experience", "Experience"], ["contact", "Contact"],
];

export default function Navbar() {
  const { profile } = useSite();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const linkCls = "rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-line/60 dark:hover:text-white";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-line dark:bg-navy/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="font-semibold text-slate-900 dark:text-white">{profile?.full_name || "Portfolio"}</Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {LINKS.map(([id, label]) => <Link key={id} to={`/#${id}`} className={linkCls}>{label}</Link>)}
        </nav>

        <div className="flex items-center gap-2">
          <button className="btn btn-ghost !px-3" onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
            {theme === "dark" ? "☀" : "☾"}
          </button>
          <button className="btn btn-ghost !px-3 md:hidden" onClick={() => setOpen(!open)}
            aria-expanded={open} aria-controls="mobile-menu" aria-label="Toggle menu">
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t border-slate-200 px-4 py-2 dark:border-line md:hidden">
          {LINKS.map(([id, label]) => (
            <Link key={id} to={`/#${id}`} onClick={() => setOpen(false)} className={`block ${linkCls}`}>{label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}
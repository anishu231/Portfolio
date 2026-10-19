import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  ["", "Dashboard"], ["profile", "Profile"], ["about", "About Me"], ["skills", "Skills"],
  ["projects", "Projects"], ["experience", "Experience"], ["education", "Education"],
  ["certifications", "Certifications"], ["resume", "Resume"], ["social", "Social Links"],
  ["messages", "Contact Messages"], ["settings", "Website Settings"],
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  async function doLogout() {
    await logout();
    nav("/admin-panel/login", { replace: true });
  }

  return (
    <div className="min-h-screen md:flex">
      <header className="flex items-center justify-between border-b border-line bg-charcoal p-3 md:hidden">
        <span className="font-semibold text-white">Admin panel</span>
        <button className="btn btn-ghost" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu">☰</button>
      </header>

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-line bg-charcoal p-4 transition-transform
          md:static md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <p className="mb-1 text-lg font-semibold text-white">Admin panel</p>
        <p className="mb-4 truncate text-xs text-slate-500">Signed in as {user?.username}</p>
        <nav className="flex-1 space-y-1 overflow-y-auto" aria-label="Admin navigation">
          {NAV.map(([path, label]) => (
            <NavLink
              key={path} end={path === ""} to={`/admin-panel/${path}`} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm ${isActive ? "bg-accent/10 text-accent" : "text-slate-300 hover:bg-line/60"}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <a href="/" target="_blank" rel="noreferrer" className="btn btn-ghost mt-3">View site ↗</a>
        <button className="btn btn-danger mt-2" onClick={doLogout}>Logout</button>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setOpen(false)} />}

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
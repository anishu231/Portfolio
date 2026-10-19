import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SiteProvider, useSite } from "../../context/SiteContext";
import { Spinner } from "../ui";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Shell() {
  const { loading, error } = useSite();
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (loading) return;
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) { el.scrollIntoView({ behavior: "smooth" }); return; }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash, key, loading]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Spinner /></div>;
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="text-red-600 dark:text-red-400">{error.message}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-2 focus:text-slate-900">
        Skip to content
      </a>
      <Navbar />
      <main id="main"><Outlet /></main>
      <Footer />
    </>
  );
}

export default function PublicLayout() {
  return <SiteProvider><Shell /></SiteProvider>;
}
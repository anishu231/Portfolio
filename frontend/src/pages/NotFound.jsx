import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <Helmet><title>Page not found</title><meta name="robots" content="noindex" /></Helmet>
      <p className="text-6xl font-bold text-teal-600 dark:text-accent">404</p>
      <p className="text-slate-600 dark:text-slate-400">This page does not exist.</p>
      <Link className="btn btn-primary" to="/">Go home</Link>
    </div>
  );
}
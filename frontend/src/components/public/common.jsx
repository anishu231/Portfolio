export const STATUS = { completed: "Completed", in_progress: "In Progress", planned: "Planned" };

export function fmtDate(d) {
  if (!d) return "";
  const [y, m] = d.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
export const dateRange = (it) => `${fmtDate(it.start_date)} – ${it.is_current ? "Present" : fmtDate(it.end_date)}`;

export function socialList(p) {
  const extra = Array.isArray(p.other_links) ? p.other_links : [];
  return [
    p.linkedin_url && ["LinkedIn", p.linkedin_url],
    p.github_url && ["GitHub", p.github_url],
    p.email && ["Email", `mailto:${p.email}`],
    ...extra.filter((l) => l && l.label && l.url).map((l) => [l.label, l.url]),
  ].filter(Boolean);
}

export function Section({ id, title, subtitle, alt, children }) {
  return (
    <section id={id} className={alt ? "bg-slate-50 dark:bg-charcoal/40" : ""}>
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

export function EmptyState({ children }) {
  return <div className="card text-center text-sm text-slate-500 dark:text-slate-400">{children}</div>;
}

export function ErrorNote({ error, onRetry }) {
  return (
    <div role="alert" className="card text-center text-sm">
      <p className="text-red-600 dark:text-red-400">{error?.message || "Something went wrong."}</p>
      {onRetry && <button className="btn btn-ghost mt-3" onClick={onRetry}>Try again</button>}
    </div>
  );
}
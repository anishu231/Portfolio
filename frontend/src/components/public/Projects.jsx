import { useState } from "react";
import { Link } from "react-router-dom";
import { Spinner } from "../ui";
import { useFetch } from "../../lib/useFetch";
import { EmptyState, ErrorNote, Section, STATUS } from "./common";

export function ProjectCard({ p }) {
  const to = `/projects/${p.slug}`;
  return (
    <article className="card flex flex-col overflow-hidden !p-0 transition hover:border-teal-600/50 dark:hover:border-accent/50">
      <Link to={to} tabIndex={-1} aria-hidden="true" className="block aspect-video bg-slate-100 dark:bg-navy">
        {p.thumbnail
          ? <img src={p.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />
          : <div className="flex h-full items-center justify-center text-sm text-slate-400">No image</div>}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2">
          <span className="badge">{STATUS[p.status]}</span>
          {p.featured && <span className="badge text-teal-700 dark:text-accent">★ Featured</span>}
        </div>
        <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
          <Link to={to} className="hover:underline">{p.title}</Link>
        </h3>
        {p.summary && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{p.summary}</p>}
        <div className="mt-3 flex flex-wrap gap-1">
          {(p.technologies || []).slice(0, 5).map((t) => <span key={t} className="badge">{t}</span>)}
        </div>
        <div className="mt-auto flex flex-wrap gap-4 pt-4 text-sm">
          <Link to={to} className="text-teal-700 hover:underline dark:text-accent">Details</Link>
          {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>}
          {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" className="hover:underline">Live demo</a>}
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  const [cat, setCat] = useState("");
  const cats = useFetch("/api/projects/categories/");
  const path = `/api/projects/?page_size=50${cat ? `&category=${encodeURIComponent(cat)}` : ""}`;
  const { data, loading, error, reload } = useFetch(path);

  const list = [...(data?.results || [])].sort((a, b) => Number(b.featured) - Number(a.featured));
  const btn = (active) =>
    `rounded-full border px-3 py-1 text-sm transition ${active
      ? "border-teal-600 bg-teal-600 text-white dark:border-accent dark:bg-accent dark:text-navy"
      : "border-slate-300 hover:bg-slate-100 dark:border-line dark:hover:bg-line/60"}`;

  let body;
  if (loading && !data) body = <Spinner />;
  else if (error) body = <ErrorNote error={error} onRetry={reload} />;
  else if (list.length === 0) body = <EmptyState>No projects to show{cat ? " in this category" : " yet"}.</EmptyState>;
  else body = (
    <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${loading ? "opacity-60" : ""}`}>
      {list.map((p) => <ProjectCard key={p.id} p={p} />)}
    </div>
  );

  return (
    <Section id="projects" title="Projects" subtitle="Things I have built and worked on.">
      {cats.data?.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter projects by category">
          <button className={btn(cat === "")} aria-pressed={cat === ""} onClick={() => setCat("")}>All</button>
          {cats.data.map((c) => (
            <button key={c} className={btn(cat === c)} aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      )}
      {body}
    </Section>
  );
}
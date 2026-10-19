import { Link, useParams } from "react-router-dom";
import { Spinner } from "../components/ui";
import { useFetch } from "../lib/useFetch";
import Seo from "../components/public/Seo";
import { ErrorNote, STATUS } from "../components/public/common";
import NotFound from "./NotFound";

export default function ProjectDetail() {
  const { slug } = useParams();
  const { data: p, loading, error, reload } = useFetch(`/api/projects/${encodeURIComponent(slug)}/`);

  if (loading) return <Spinner />;
  if (error?.status === 404) return <NotFound />;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorNote error={error} onRetry={reload} /></div>;
  if (!p) return null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Seo title={p.title} description={p.summary} image={p.thumbnail} type="article" />
      <Link to="/#projects" className="text-sm text-teal-700 hover:underline dark:text-accent">← Back to projects</Link>

      {p.thumbnail && <img src={p.thumbnail} alt={p.title} className="mt-6 w-full rounded-xl border border-slate-200 object-cover dark:border-line" />}

      <h1 className="mt-6 text-3xl font-bold text-slate-900 dark:text-white">{p.title}</h1>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="badge">{STATUS[p.status]}</span>
        {p.category && <span className="badge">{p.category}</span>}
        {p.featured && <span className="badge text-teal-700 dark:text-accent">★ Featured</span>}
      </div>

      {p.summary && <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">{p.summary}</p>}
      {p.description && <p className="mt-5 whitespace-pre-line leading-relaxed">{p.description}</p>}

      {p.technologies?.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Technologies</h2>
          <div className="flex flex-wrap gap-2">{p.technologies.map((t) => <span key={t} className="badge">{t}</span>)}</div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        {p.live_url && <a className="btn btn-primary" href={p.live_url} target="_blank" rel="noreferrer">Live demo</a>}
        {p.github_url && <a className="btn btn-ghost" href={p.github_url} target="_blank" rel="noreferrer">View on GitHub</a>}
      </div>
    </article>
  );
}
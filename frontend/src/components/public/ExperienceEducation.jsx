import { Spinner } from "../ui";
import { useFetch } from "../../lib/useFetch";
import { dateRange, EmptyState, ErrorNote, fmtDate, Section } from "./common";

function Timeline({ items }) {
  return (
    <ol className="border-l border-slate-300 dark:border-line">
      {items.map((it) => (
        <li key={it.id} className="relative mb-8 ml-5 last:mb-0">
          <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-teal-600 dark:border-navy dark:bg-accent" />
          <p className="text-xs text-slate-500">{it.range}</p>
          <h4 className="font-semibold text-slate-900 dark:text-white">{it.title}</h4>
          <p className="text-sm text-teal-700 dark:text-accent">{it.subtitle}</p>
          {it.description && <p className="mt-2 whitespace-pre-line text-sm">{it.description}</p>}
        </li>
      ))}
    </ol>
  );
}

export default function ExperienceEducation() {
  const exp = useFetch("/api/experience/");
  const edu = useFetch("/api/education/");
  const cert = useFetch("/api/certifications/");
  const loading = exp.loading || edu.loading || cert.loading;
  const error = exp.error || edu.error || cert.error;
  const reload = () => { exp.reload(); edu.reload(); cert.reload(); };

  const experience = (exp.data || []).map((e) => ({
    id: e.id, range: dateRange(e), title: e.job_title,
    subtitle: e.company + (e.location ? ` · ${e.location}` : ""), description: e.description,
  }));
  const education = (edu.data || []).map((e) => ({
    id: e.id, range: dateRange(e),
    title: e.degree + (e.field_of_study ? `, ${e.field_of_study}` : ""),
    subtitle: e.institution + (e.location ? ` · ${e.location}` : ""), description: e.description,
  }));
  const certs = cert.data || [];

  let body;
  if (loading) body = <Spinner />;
  else if (error) body = <ErrorNote error={error} onRetry={reload} />;
  else if (!experience.length && !education.length && !certs.length)
    body = <EmptyState>Experience and education have not been added yet.</EmptyState>;
  else body = (
    <div className="space-y-12">
      {(experience.length > 0 || education.length > 0) && (
        <div className="grid gap-10 md:grid-cols-2">
          {experience.length > 0 && (
            <div><h3 className="mb-5 text-lg font-semibold text-slate-900 dark:text-white">Experience</h3><Timeline items={experience} /></div>
          )}
          {education.length > 0 && (
            <div><h3 className="mb-5 text-lg font-semibold text-slate-900 dark:text-white">Education</h3><Timeline items={education} /></div>
          )}
        </div>
      )}
      {certs.length > 0 && (
        <div>
          <h3 className="mb-5 text-lg font-semibold text-slate-900 dark:text-white">Certifications</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certs.map((c) => (
              <div key={c.id} className="card">
                <p className="font-medium text-slate-900 dark:text-white">{c.name}</p>
                <p className="text-sm text-teal-700 dark:text-accent">{c.issuer}</p>
                {c.issue_date && <p className="mt-1 text-xs text-slate-500">Issued {fmtDate(c.issue_date)}</p>}
                {c.credential_url && (
                  <a href={c.credential_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm underline">Verify credential</a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return <Section id="experience" title="Experience & Education" alt>{body}</Section>;
}
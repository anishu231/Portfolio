import { Spinner } from "../ui";
import { useFetch } from "../../lib/useFetch";
import { EmptyState, ErrorNote, Section } from "./common";

const ORDER = ["programming", "backend", "databases", "cybersecurity", "networking", "linux", "cloud", "devops", "tools"];

export default function Skills() {
  const { data, loading, error, reload } = useFetch("/api/skills/");

  let body;
  if (loading) body = <Spinner />;
  else if (error) body = <ErrorNote error={error} onRetry={reload} />;
  else if (!data?.length) body = <EmptyState>No skills added yet.</EmptyState>;
  else {
    const groups = {};
    data.forEach((s) => {
      if (!groups[s.category]) groups[s.category] = { label: s.category_label, items: [] };
      groups[s.category].items.push(s);
    });
    const keys = Object.keys(groups).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
    body = (
      <div className="space-y-10">
        {keys.map((k) => (
          <div key={k}>
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">{groups[k].label}</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groups[k].items.map((s) => {
                const hasLevel = s.proficiency !== null && s.proficiency !== undefined && s.proficiency !== "";
                return (
                  <div key={s.id} className="card">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {s.icon && <span className="mr-2">{s.icon}</span>}
                        {s.name}
                      </p>
                      {hasLevel && <span className="text-xs text-slate-500">{s.proficiency}%</span>}
                    </div>
                    {s.description && (
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{s.description}</p>
                    )}
                    {hasLevel && (
                      <div
                        className="mt-3 h-1.5 rounded-full bg-slate-200 dark:bg-line"
                        role="progressbar"
                        aria-label={`${s.name} proficiency`}
                        aria-valuenow={s.proficiency}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className="h-full rounded-full bg-teal-600 dark:bg-accent"
                          style={{ width: `${s.proficiency}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <Section id="skills" title="Skills" alt>{body}</Section>;
}
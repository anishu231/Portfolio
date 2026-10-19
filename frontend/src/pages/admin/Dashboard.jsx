import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { PageHeader, Spinner } from "../../components/ui";
import { useToast } from "../../context/ToastContext";

const CARDS = [
  ["projects", "Projects", "projects"], ["skills", "Skills", "skills"],
  ["experience", "Experience", "experience"], ["education", "Education", "education"],
  ["certifications", "Certifications", "certifications"], ["messages", "Messages", "messages"],
];

export default function Dashboard() {
  const toast = useToast();
  const [s, setS] = useState(null);

  useEffect(() => {
    api.get("/api/admin/stats/").then(setS).catch((e) => toast.error(e.message));
  }, [toast]);

  if (!s) return <Spinner />;
  return (
    <>
      <PageHeader title="Dashboard" description="Everything you save here appears on the public site immediately." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map(([key, label, path]) => (
          <Link key={key} to={`/admin-panel/${path}`} className="card transition hover:border-accent/50">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-1 text-3xl font-semibold text-white">{s[key]}</p>
            {key === "projects" && <p className="mt-1 text-xs text-slate-500">{s.published_projects} published</p>}
            {key === "messages" && <p className="mt-1 text-xs text-slate-500">{s.unread_messages} unread</p>}
          </Link>
        ))}
        <Link to="/admin-panel/resume" className="card transition hover:border-accent/50">
          <p className="text-sm text-slate-400">Resume</p>
          <p className="mt-1 text-xl font-semibold text-white">{s.has_resume ? "Uploaded ✓" : "Not uploaded"}</p>
        </Link>
      </div>
    </>
  );
}
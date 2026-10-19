import { useCallback, useEffect, useState } from "react";
import { api, fieldError, toFormData } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import { ConfirmDialog, FormField, ImageUpload, Modal, PageHeader, Spinner } from "../../components/ui";

const STATUS = [
  { value: "completed", label: "Completed" },
  { value: "in_progress", label: "In Progress" },
  { value: "planned", label: "Planned" },
];
const STATUS_LABEL = Object.fromEntries(STATUS.map((s) => [s.value, s.label]));

const FIELDS = [
  { name: "title", label: "Project title", required: true, maxLength: 160, full: true },
  { name: "summary", label: "Short summary (card text)", maxLength: 300, full: true },
  { name: "description", label: "Description", type: "textarea", rows: 6 },
  { name: "technologies", label: "Technologies", full: true, hint: "Comma separated, e.g. Python, Django, React" },
  { name: "github_url", label: "GitHub repository URL", type: "url" },
  { name: "live_url", label: "Live demo URL", type: "url" },
  { name: "category", label: "Category", maxLength: 60, placeholder: "Web, Security, DevOps…" },
  { name: "status", label: "Status", type: "select", options: STATUS },
  { name: "featured", label: "Featured project", type: "checkbox" },
  { name: "is_published", label: "Published (visible on public site)", type: "checkbox" },
];

const EMPTY = {
  title: "", summary: "", description: "", technologies: "", github_url: "", live_url: "",
  category: "", status: "completed", featured: false, is_published: false,
};

function ProjectForm({ project, onSaved, onCancel }) {
  const toast = useToast();
  const [v, setV] = useState(
    project ? { ...project, technologies: (project.technologies || []).join(", ") } : EMPTY
  );
  const [file, setFile] = useState(null);
  const [removed, setRemoved] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (n, val) => setV((p) => ({ ...p, [n]: val }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const payload = {};
      FIELDS.forEach((f) => (payload[f.name] = v[f.name]));
      if (file) payload.thumbnail = file;
      else if (removed) payload.remove_thumbnail = true;
      const body = toFormData(payload);
      if (project) await api.patch(`/api/admin/projects/${project.id}/`, body);
      else await api.post("/api/admin/projects/", body);
      toast.success("Project saved.");
      onSaved();
    } catch (err) {
      setErrors(err.fields || {});
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        {FIELDS.map((f) => (
          <FormField key={f.name} f={f} value={v[f.name]} onChange={set} error={fieldError(errors, f.name)} />
        ))}
      </div>
      <ImageUpload
        label="Project thumbnail / screenshot" url={project?.thumbnail} file={file} removed={removed}
        onFile={setFile} onRemoveChange={setRemoved} error={fieldError(errors, "thumbnail")}
      />
      <div className="flex justify-end gap-3">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={saving}>Cancel</button>
        <button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save project"}</button>
      </div>
    </form>
  );
}

function PreviewModal({ p, onClose }) {
  return (
    <Modal title="Preview" onClose={onClose} wide>
      {p.thumbnail && <img src={p.thumbnail} alt={p.title} className="mb-4 max-h-64 w-full rounded-lg object-cover" />}
      <h3 className="text-xl font-semibold text-white">{p.title}</h3>
      <p className="mt-1 text-sm text-slate-400">{p.category || "Uncategorized"} · {STATUS_LABEL[p.status]}{p.featured ? " · ★ Featured" : ""}</p>
      {p.summary && <p className="mt-3 text-slate-300">{p.summary}</p>}
      {p.description && <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{p.description}</p>}
      <div className="mt-3 flex flex-wrap gap-2">{(p.technologies || []).map((t) => <span key={t} className="badge">{t}</span>)}</div>
      <div className="mt-4 flex gap-3 text-sm">
        {p.github_url && <a className="text-accent underline" href={p.github_url} target="_blank" rel="noreferrer">GitHub</a>}
        {p.live_url && <a className="text-accent underline" href={p.live_url} target="_blank" rel="noreferrer">Live demo</a>}
      </div>
    </Modal>
  );
}

export default function ProjectsManager() {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | project
  const [preview, setPreview] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    () => api.get("/api/admin/projects/?page_size=50")
      .then((d) => setItems(d.results))
      .catch((e) => { toast.error(e.message); setItems([]); }),
    [toast]
  );
  useEffect(() => { load(); }, [load]);

  async function togglePublish(p) {
    try {
      const updated = await api.post(`/api/admin/projects/${p.id}/${p.is_published ? "unpublish" : "publish"}/`);
      setItems((list) => list.map((x) => (x.id === p.id ? updated : x)));
      toast.success(updated.is_published ? "Project published." : "Project unpublished.");
    } catch (e) { toast.error(e.message); }
  }

  async function remove() {
    setBusy(true);
    try {
      await api.del(`/api/admin/projects/${toDelete.id}/`);
      toast.success("Project deleted.");
      setToDelete(null);
      load();
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  }

  if (!items) return <Spinner />;
  const shown = items.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <PageHeader
        title="Projects" description="Only published projects appear on the public site."
        action={<button className="btn btn-primary" onClick={() => setEditing("new")}>+ Add project</button>}
      />
      <input
        className="input mb-4 max-w-xs" placeholder="Search projects…" aria-label="Search projects"
        value={search} onChange={(e) => setSearch(e.target.value)}
      />

      {shown.length === 0 ? (
        <div className="card text-center text-sm text-slate-400">No projects found.</div>
      ) : (
        <ul className="space-y-2">
          {shown.map((p) => (
            <li key={p.id} className="card flex flex-wrap items-center gap-3 !p-4">
              {p.thumbnail
                ? <img src={p.thumbnail} alt="" className="h-14 w-20 rounded object-cover" />
                : <div className="flex h-14 w-20 items-center justify-center rounded bg-navy text-xs text-slate-500">No image</div>}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{p.title}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <span className="badge">{STATUS_LABEL[p.status]}</span>
                  {p.category && <span className="badge">{p.category}</span>}
                  {p.featured && <span className="badge text-accent">★ Featured</span>}
                  <span className={`badge ${p.is_published ? "text-accent" : "text-amber-400"}`}>
                    {p.is_published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <button className="btn btn-ghost" onClick={() => setPreview(p)}>Preview</button>
              <button className="btn btn-ghost" onClick={() => togglePublish(p)}>{p.is_published ? "Unpublish" : "Publish"}</button>
              <button className="btn btn-ghost" onClick={() => setEditing(p)}>Edit</button>
              <button className="btn btn-danger" onClick={() => setToDelete(p)}>Delete</button>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <Modal title={editing === "new" ? "Add project" : "Edit project"} wide onClose={() => setEditing(null)}>
          <ProjectForm
            project={editing === "new" ? null : editing}
            onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }}
          />
        </Modal>
      )}
      {preview && <PreviewModal p={preview} onClose={() => setPreview(null)} />}
      {toDelete && (
        <ConfirmDialog
          title="Delete project?" busy={busy} onConfirm={remove} onCancel={() => setToDelete(null)}
          message={`“${toDelete.title}” and its image will be permanently deleted.`}
        />
      )}
    </>
  );
}
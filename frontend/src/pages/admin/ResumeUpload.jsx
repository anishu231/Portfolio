import { useEffect, useState } from "react";
import { api, fieldError, toFormData } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import { ConfirmDialog, PageHeader, Spinner } from "../../components/ui";

export default function ResumeUpload() {
  const toast = useToast();
  const [current, setCurrent] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const load = () => api.get("/api/admin/resume/").then(setCurrent).catch((e) => toast.error(e.message));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function pick(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    setError("");
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".pdf")) return setError("Only PDF files are allowed.");
    if (f.size > 10 * 1024 * 1024) return setError("PDF must be 10 MB or smaller.");
    setFile(f);
  }

  async function upload() {
    setSaving(true);
    setError("");
    try {
      await api.post("/api/admin/resume/", toFormData({ file }));
      toast.success("Resume uploaded.");
      setFile(null);
      await load();
    } catch (err) {
      setError(fieldError(err.fields, "file") || err.message);
      toast.error("Upload failed.");
    } finally { setSaving(false); }
  }

  async function remove() {
    try {
      await api.del("/api/admin/resume/");
      toast.success("Resume deleted.");
      setConfirm(false);
      load();
    } catch (e) { toast.error(e.message); }
  }

  if (!current) return <Spinner />;
  return (
    <>
      <PageHeader title="Resume" description="The newest PDF you upload becomes the public Download Resume file." />
      <div className="card space-y-4">
        <div>
          <p className="text-sm font-medium text-slate-300">Current resume</p>
          {current.file ? (
            <p className="mt-1 text-sm">
              <a className="text-accent underline" href={current.file} target="_blank" rel="noreferrer">Open PDF ↗</a>
              <span className="ml-2 text-slate-500">uploaded {new Date(current.uploaded_at).toLocaleString()}</span>
            </p>
          ) : <p className="mt-1 text-sm text-slate-500">No resume uploaded yet.</p>}
        </div>

        <div>
          <label htmlFor="resume-file" className="mb-1 block text-sm font-medium text-slate-300">
            {current.file ? "Replace with a new PDF" : "Upload PDF"}
          </label>
          <input id="resume-file" type="file" accept="application/pdf,.pdf" onChange={pick}
            className="block w-full text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-line file:px-4 file:py-2 file:text-slate-200" />
          <p className="mt-1 text-xs text-slate-500">PDF only, max 10 MB.</p>
          {file && <p className="mt-2 text-sm text-slate-300">Selected: {file.name} ({(file.size / 1024).toFixed(0)} KB)</p>}
          {error && <p role="alert" className="mt-2 text-sm text-red-400">{error}</p>}
        </div>

        <div className="flex gap-3">
          <button className="btn btn-primary" disabled={!file || saving} onClick={upload}>
            {saving ? "Uploading…" : "Upload resume"}
          </button>
          {current.file && <button className="btn btn-danger" onClick={() => setConfirm(true)}>Delete current</button>}
        </div>
      </div>
      {confirm && (
        <ConfirmDialog title="Delete resume?" message="The Download Resume button will stop working until you upload a new PDF."
          onConfirm={remove} onCancel={() => setConfirm(false)} />
      )}
    </>
  );
}
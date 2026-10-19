import { useCallback, useEffect, useState } from "react";
import { api, fieldError, toFormData } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import { FormField, ImageUpload, PageHeader, Spinner } from "../../components/ui";

export default function SingletonForm({
  title, description, endpoint, fields, images = [], extraKeys = [], extra,
}) {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [v, setV] = useState({});
  const [files, setFiles] = useState({});
  const [removed, setRemoved] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const reset = useCallback((d) => {
    setData(d); setV(d); setFiles({}); setRemoved({}); setErrors({});
  }, []);

  const load = useCallback(
    () => api.get(endpoint).then(reset).catch((e) => toast.error(e.message)),
    [endpoint, reset, toast]
  );
  useEffect(() => { load(); }, [load]);

  if (!data) return <Spinner />;
  const set = (name, value) => setV((p) => ({ ...p, [name]: value }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const payload = {};
      [...fields.map((f) => f.name), ...extraKeys].forEach((k) => (payload[k] = v[k]));
      images.forEach((img) => {
        if (files[img.name]) payload[img.name] = files[img.name];
        else if (removed[img.name]) payload[`remove_${img.name}`] = true;
      });
      const res = await api.patch(endpoint, images.length ? toFormData(payload) : payload);
      reset(res);
      toast.success("Changes saved.");
    } catch (err) {
      setErrors(err.fields || {});
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <PageHeader title={title} description={description} />

      <div className="card grid gap-4 md:grid-cols-2">
        {fields.map((f) => (
          <FormField key={f.name} f={f} value={v[f.name]} onChange={set} error={fieldError(errors, f.name)} />
        ))}
      </div>

      {images.length > 0 && (
        <div className="card grid gap-6 md:grid-cols-2">
          {images.map((img) => (
            <ImageUpload
              key={img.name} label={img.label} url={data[img.name]}
              file={files[img.name]} removed={!!removed[img.name]}
              onFile={(f) => setFiles((p) => ({ ...p, [img.name]: f }))}
              onRemoveChange={(r) => setRemoved((p) => ({ ...p, [img.name]: r }))}
              error={fieldError(errors, img.name)}
            />
          ))}
        </div>
      )}

      {extra && <div className="card">{extra({ values: v, set, errors })}</div>}

      <div className="flex flex-wrap gap-3">
        <button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
        <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => reset(data)}>Cancel</button>
        <button type="button" className="btn btn-ghost" onClick={() => window.open("/", "_blank")}>Preview</button>
      </div>
    </form>
  );
}
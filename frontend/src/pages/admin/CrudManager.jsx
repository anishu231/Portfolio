import { useCallback, useEffect, useState } from "react";
import { api, fieldError } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import { ConfirmDialog, FormField, Modal, PageHeader, Spinner } from "../../components/ui";

function RecordForm({ noun, endpoint, fields, initial, onSaved, onCancel }) {
  const toast = useToast();
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (n, val) => setV((p) => ({ ...p, [n]: val }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const payload = {};
      fields.forEach((f) => {
        const val = v[f.name];
        payload[f.name] = f.type === "date" && val === "" ? null : val;
      });
      if (initial.id) await api.patch(`${endpoint}${initial.id}/`, payload);
      else await api.post(endpoint, payload);
      toast.success(`${noun} saved.`);
      onSaved();
    } catch (err) {
      setErrors(err.fields || {});
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((f) => (
          <FormField key={f.name} f={f} value={v[f.name]} onChange={set} error={fieldError(errors, f.name)} />
        ))}
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={saving}>Cancel</button>
        <button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}

export default function CrudManager({ title, noun, endpoint, fields, defaults, sortable, describe }) {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    () => api.get(endpoint).then(setItems).catch((e) => { toast.error(e.message); setItems([]); }),
    [endpoint, toast]
  );
  useEffect(() => { load(); }, [load]);

  async function remove() {
    setBusy(true);
    try {
      await api.del(`${endpoint}${toDelete.id}/`);
      toast.success(`${noun} deleted.`);
      setToDelete(null);
      load();
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  }

  async function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    try {
      await api.post(`${endpoint}reorder/`, { ids: next.map((x) => x.id) });
    } catch (e) { toast.error(e.message); load(); }
  }

  if (!items) return <Spinner />;

  return (
    <>
      <PageHeader
        title={title}
        action={<button className="btn btn-primary" onClick={() => setEditing({ ...defaults })}>+ Add {noun}</button>}
      />

      {items.length === 0 ? (
        <div className="card text-center text-sm text-slate-400">No entries yet. Click “Add {noun}” to create one.</div>
      ) : (
        <ul className="space-y-2">
          {items.map((it, i) => {
            const d = describe(it);
            return (
              <li key={it.id} className="card flex flex-wrap items-center gap-3 !p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{d.title}</p>
                  {d.subtitle && <p className="truncate text-sm text-slate-400">{d.subtitle}</p>}
                </div>
                {sortable && (
                  <div className="flex gap-1">
                    <button className="btn btn-ghost !px-2" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                    <button className="btn btn-ghost !px-2" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">↓</button>
                  </div>
                )}
                <button className="btn btn-ghost" onClick={() => setEditing(it)}>Edit</button>
                <button className="btn btn-danger" onClick={() => setToDelete(it)}>Delete</button>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <Modal title={editing.id ? `Edit ${noun}` : `Add ${noun}`} onClose={() => setEditing(null)}>
          <RecordForm
            noun={noun} endpoint={endpoint} fields={fields} initial={editing}
            onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }}
          />
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title={`Delete ${noun}?`} busy={busy} onConfirm={remove} onCancel={() => setToDelete(null)}
          message={`“${describe(toDelete).title}” will be permanently deleted. This cannot be undone.`}
        />
      )}
    </>
  );
}
import { useCallback, useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import { ConfirmDialog, PageHeader, Spinner } from "../../components/ui";

export default function MessagesInbox() {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [open, setOpen] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(
    () => api.get("/api/admin/messages/?page_size=50")
      .then((d) => setItems(d.results))
      .catch((e) => { toast.error(e.message); setItems([]); }),
    [toast]
  );
  useEffect(() => { load(); }, [load]);

  async function toggle(m) {
    setOpen(open === m.id ? null : m.id);
    if (!m.is_read) {
      try {
        await api.patch(`/api/admin/messages/${m.id}/`, { is_read: true });
        setItems((l) => l.map((x) => (x.id === m.id ? { ...x, is_read: true } : x)));
      } catch (e) { toast.error(e.message); }
    }
  }

  async function remove() {
    try {
      await api.del(`/api/admin/messages/${toDelete.id}/`);
      toast.success("Message deleted.");
      setToDelete(null);
      load();
    } catch (e) { toast.error(e.message); }
  }

  if (!items) return <Spinner />;
  return (
    <>
      <PageHeader title="Contact Messages" description="Only you can see these. They are never exposed by the public API." />
      {items.length === 0 ? (
        <div className="card text-center text-sm text-slate-400">No messages yet.</div>
      ) : (
        <ul className="space-y-2">
          {items.map((m) => (
            <li key={m.id} className="card !p-0">
              <button className="flex w-full items-center gap-3 p-4 text-left" onClick={() => toggle(m)} aria-expanded={open === m.id}>
                {!m.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Unread" />}
                <div className="min-w-0 flex-1">
                  <p className={`truncate ${m.is_read ? "text-slate-300" : "font-semibold text-white"}`}>{m.subject}</p>
                  <p className="truncate text-sm text-slate-500">{m.name} · {m.email}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-500">{new Date(m.created_at).toLocaleString()}</span>
              </button>
              {open === m.id && (
                <div className="border-t border-line p-4">
                  <p className="whitespace-pre-wrap text-sm text-slate-200">{m.message}</p>
                  <div className="mt-4 flex gap-3">
                    <a className="btn btn-primary" href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + m.subject)}`}>Reply by email</a>
                    <button className="btn btn-danger" onClick={() => setToDelete(m)}>Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {toDelete && (
        <ConfirmDialog title="Delete message?" message="This message will be permanently deleted."
          onConfirm={remove} onCancel={() => setToDelete(null)} />
      )}
    </>
  );
}
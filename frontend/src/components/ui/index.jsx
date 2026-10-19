import { useEffect, useId, useState } from "react";
import { useToast } from "../../context/ToastContext";

export function Spinner() {
  return (
    <div role="status" aria-label="Loading" className="flex justify-center py-10">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  );
}

export function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4"
      role="dialog" aria-modal="true" aria-label={title}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`card my-8 w-full ${wide ? "max-w-3xl" : "max-w-xl"}`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button className="text-slate-400 hover:text-white" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmLabel = "Delete", busy, onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm text-slate-300">{message}</p>
      <div className="mt-5 flex justify-end gap-3">
        <button className="btn btn-ghost" onClick={onCancel} disabled={busy}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
          {busy ? "Working…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// f = { name, label, type, options, required, maxLength, hint, rows, full, placeholder, min, max }
export function FormField({ f, value, onChange, error }) {
  const id = `f-${f.name}`;

  if (f.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-sm md:col-span-2">
        <input
          type="checkbox" className="h-4 w-4 accent-accent"
          checked={!!value} onChange={(e) => onChange(f.name, e.target.checked)}
        />
        <span>{f.label}</span>
        {f.hint && <span className="text-slate-500">— {f.hint}</span>}
      </label>
    );
  }

  const common = {
    id, name: f.name, className: "input", required: f.required,
    maxLength: f.maxLength, placeholder: f.placeholder,
  };
  let control;
  if (f.type === "textarea") {
    control = <textarea {...common} rows={f.rows || 4} value={value ?? ""} onChange={(e) => onChange(f.name, e.target.value)} />;
  } else if (f.type === "select") {
    control = (
      <select {...common} value={value ?? ""} onChange={(e) => onChange(f.name, e.target.value)}>
        {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  } else {
    control = (
      <input
        {...common} type={f.type || "text"} min={f.min} max={f.max}
        value={value ?? ""}
        onChange={(e) =>
          onChange(f.name, f.type === "number" && e.target.value !== "" ? Number(e.target.value) : e.target.value)
        }
      />
    );
  }

  return (
    <div className={f.full || f.type === "textarea" ? "md:col-span-2" : ""}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-300">
        {f.label}{f.required && <span className="text-red-400"> *</span>}
      </label>
      {control}
      {f.hint && <p className="mt-1 text-xs text-slate-500">{f.hint}</p>}
      {error && <p role="alert" className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function ImageUpload({ label, url, file, removed, onFile, onRemoveChange, error }) {
  const toast = useToast();
  const inputId = useId();
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const shown = preview || (removed ? null : url);

  function pick(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type))
      return toast.error("Only JPG, PNG and WebP images are allowed.");
    if (f.size > 5 * 1024 * 1024) return toast.error("Image must be 5 MB or smaller.");
    onFile(f);
    onRemoveChange(false);
  }

  return (
    <div>
      <p className="mb-1 text-sm font-medium text-slate-300">{label}</p>
      <div className="flex h-40 items-center justify-center overflow-hidden rounded-lg border border-dashed border-line bg-navy">
        {shown
          ? <img src={shown} alt={label} className="h-full w-full object-cover" />
          : <span className="text-sm text-slate-500">No image</span>}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <label htmlFor={inputId} className="btn btn-ghost cursor-pointer">
          {shown ? "Replace image" : "Choose image"}
        </label>
        <input id={inputId} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={pick} />
        {shown && (
          <button type="button" className="btn btn-danger"
            onClick={() => (file ? onFile(null) : onRemoveChange(true))}>
            Remove
          </button>
        )}
        {removed && url && !file && (
          <button type="button" className="btn btn-ghost" onClick={() => onRemoveChange(false)}>Undo remove</button>
        )}
      </div>
      <p className="mt-1 text-xs text-slate-500">JPG, PNG or WebP, max 5 MB. Saved only when you click Save.</p>
      {error && <p role="alert" className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
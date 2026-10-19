import { useState } from "react";
import { api, fieldError } from "../../lib/api";
import { useSite } from "../../context/SiteContext";
import { Section, socialList } from "./common";

const EMPTY = { name: "", email: "", subject: "", message: "", website: "" }; // "website" = honeypot

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      {children}
      {error && <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export default function Contact() {
  const { profile: p, settings } = useSite();
  const [v, setV] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  const showForm = settings?.show_contact_form !== false;
  const links = socialList(p).filter(([name]) => name !== "Email");

  async function submit(e) {
    e.preventDefault();
    setSending(true);
    setErrors({});
    setStatus(null);
    try {
      const res = await api.post("/api/contact/", v);
      setStatus({ ok: true, msg: res.detail || "Message sent." });
      setV(EMPTY);
    } catch (err) {
      if (err.status === 429) setStatus({ ok: false, msg: "Too many messages. Please try again later." });
      else if (err.status === 400) { setErrors(err.fields || {}); setStatus({ ok: false, msg: "Please fix the highlighted fields." }); }
      else setStatus({ ok: false, msg: err.message });
    } finally {
      setSending(false);
    }
  }

  const info = (label, content) => (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-slate-900 dark:text-white">{content}</p>
    </div>
  );

  return (
    <Section id="contact" title="Contact" subtitle="Have a project or opportunity in mind? Send me a message.">
      <div className={`grid gap-8 ${showForm ? "md:grid-cols-5" : ""}`}>
        <div className="space-y-4 md:col-span-2">
          {p.email && info("Email", <a className="underline" href={`mailto:${p.email}`}>{p.email}</a>)}
          {p.phone && info("Phone", p.phone)}
          {p.location && info("Location", p.location)}
          {links.length > 0 && (
            <ul className="flex flex-wrap gap-2 pt-2">
              {links.map(([name, url]) => (
                <li key={name + url}><a className="badge hover:bg-slate-100 dark:hover:bg-line/60" href={url} target="_blank" rel="noreferrer">{name}</a></li>
              ))}
            </ul>
          )}
        </div>

        {showForm && (
          <form onSubmit={submit} className="card relative space-y-4 md:col-span-3" noValidate={false}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="c-name" label="Name" error={fieldError(errors, "name")}>
                <input id="c-name" className="input" required minLength={2} maxLength={120} autoComplete="name" value={v.name} onChange={set("name")} />
              </Field>
              <Field id="c-email" label="Email" error={fieldError(errors, "email")}>
                <input id="c-email" type="email" className="input" required autoComplete="email" value={v.email} onChange={set("email")} />
              </Field>
            </div>
            <Field id="c-subject" label="Subject" error={fieldError(errors, "subject")}>
              <input id="c-subject" className="input" required minLength={3} maxLength={200} value={v.subject} onChange={set("subject")} />
            </Field>
            <Field id="c-message" label="Message" error={fieldError(errors, "message")}>
              <textarea id="c-message" rows={6} className="input" required minLength={10} maxLength={5000} value={v.message} onChange={set("message")} />
            </Field>

            {/* Honeypot: hidden from people and screen readers, bots fill it in */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>Website<input tabIndex={-1} autoComplete="off" name="website" value={v.website} onChange={set("website")} /></label>
            </div>

            {status && (
              <p role={status.ok ? "status" : "alert"}
                className={`text-sm ${status.ok ? "text-emerald-600 dark:text-accent" : "text-red-600 dark:text-red-400"}`}>
                {status.msg}
              </p>
            )}
            <button className="btn btn-primary" disabled={sending}>{sending ? "Sending…" : "Send message"}</button>
          </form>
        )}
      </div>
    </Section>
  );
}
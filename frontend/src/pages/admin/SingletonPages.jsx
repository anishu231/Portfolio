import SingletonForm from "./SingletonForm";
import { fieldError } from "../../lib/api";

export function ProfileForm() {
  const fields = [
    { name: "full_name", label: "Full name", required: true, maxLength: 120 },
    { name: "title", label: "Professional title", maxLength: 160 },
    { name: "short_intro", label: "Short introduction", type: "textarea", rows: 3, maxLength: 300 },
    { name: "email", label: "Email", type: "email" },
    { name: "phone", label: "Phone (optional)", maxLength: 30 },
    { name: "show_phone", label: "Show phone number on public site", type: "checkbox" },
    { name: "location", label: "Location", maxLength: 120 },
    {
      name: "availability_status", label: "Availability status", type: "select",
      options: [
        { value: "available", label: "Available for work" },
        { value: "open", label: "Open to opportunities" },
        { value: "busy", label: "Currently unavailable" },
      ],
    },
    { name: "availability_note", label: "Availability note", maxLength: 160, full: true, placeholder: "e.g. Open to remote roles" },
  ];
  return (
    <SingletonForm
      title="Profile" description="Shown in the hero section of your public site."
      endpoint="/api/admin/profile/" fields={fields}
      images={[
        { name: "profile_picture", label: "Profile picture" },
        { name: "hero_background", label: "Hero background (optional)" },
      ]}
    />
  );
}

export function AboutForm() {
  const fields = [
    { name: "about_me", label: "About me / personal summary", type: "textarea", rows: 7 },
    { name: "career_objective", label: "Career objective", type: "textarea", rows: 4 },
    { name: "background_interests", label: "Professional background & interests", type: "textarea", rows: 5 },
  ];
  return (
    <SingletonForm
      title="About Me" description="Education, experience and certifications have their own sections."
      endpoint="/api/admin/profile/" fields={fields}
    />
  );
}

function LinksEditor({ values, set, errors }) {
  const links = values.other_links || [];
  const update = (i, key, val) => set("other_links", links.map((l, idx) => (idx === i ? { ...l, [key]: val } : l)));
  return (
    <div>
      <h2 className="mb-3 text-sm font-medium text-slate-300">Other social links (max 10)</h2>
      {links.map((l, i) => (
        <div key={i} className="mb-2 flex flex-wrap gap-2">
          <input className="input w-40" placeholder="Label" aria-label={`Link ${i + 1} label`}
            value={l.label} onChange={(e) => update(i, "label", e.target.value)} />
          <input className="input min-w-0 flex-1" type="url" placeholder="https://…" aria-label={`Link ${i + 1} URL`}
            value={l.url} onChange={(e) => update(i, "url", e.target.value)} />
          <button type="button" className="btn btn-danger"
            onClick={() => set("other_links", links.filter((_, idx) => idx !== i))}>Remove</button>
        </div>
      ))}
      {links.length < 10 && (
        <button type="button" className="btn btn-ghost" onClick={() => set("other_links", [...links, { label: "", url: "" }])}>
          + Add link
        </button>
      )}
      {fieldError(errors, "other_links") && (
        <p role="alert" className="mt-2 text-xs text-red-400">{fieldError(errors, "other_links")}</p>
      )}
    </div>
  );
}

export function SocialLinksForm() {
  const fields = [
    { name: "linkedin_url", label: "LinkedIn URL", type: "url" },
    { name: "github_url", label: "GitHub URL", type: "url" },
  ];
  return (
    <SingletonForm
      title="Social Links" description="Your public email is set in the Profile section."
      endpoint="/api/admin/profile/" fields={fields} extraKeys={["other_links"]}
      extra={(p) => <LinksEditor {...p} />}
    />
  );
}

export function SettingsForm() {
  const fields = [
    { name: "site_title", label: "Site title", required: true, maxLength: 120 },
    { name: "meta_description", label: "Meta description (SEO)", type: "textarea", rows: 3, maxLength: 300 },
    { name: "footer_text", label: "Footer text", maxLength: 200, full: true },
    {
      name: "default_theme", label: "Default theme", type: "select",
      options: [
        { value: "dark", label: "Dark" }, { value: "light", label: "Light" }, { value: "system", label: "System" },
      ],
    },
    { name: "show_resume_button", label: "Show Download Resume button", type: "checkbox" },
    { name: "show_contact_form", label: "Show contact form", type: "checkbox" },
  ];
  return (
    <SingletonForm
      title="Website Settings" endpoint="/api/admin/settings/" fields={fields}
      images={[{ name: "og_image", label: "Social preview image (1200×630 recommended)" }]}
    />
  );
}
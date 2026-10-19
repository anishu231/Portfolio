import CrudManager from "./CrudManager";

const fmt = (d) => (d ? new Date(d).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "");
const range = (it) => `${fmt(it.start_date)} – ${it.is_current ? "Present" : fmt(it.end_date)}`;

const CATEGORIES = [
  ["programming", "Programming"], ["backend", "Backend Development"], ["databases", "Databases"],
  ["cybersecurity", "Cybersecurity"], ["networking", "Networking"], ["linux", "Linux"],
  ["cloud", "Cloud"], ["devops", "DevOps"], ["tools", "Tools"],
].map(([value, label]) => ({ value, label }));

export function SkillsManager() {
  const fields = [
    { name: "name", label: "Skill name", required: true, maxLength: 80 },
    { name: "category", label: "Category", type: "select", options: CATEGORIES },
    { name: "proficiency", label: "Proficiency (1–100)", type: "number", min: 1, max: 100 },
    { name: "icon", label: "Icon (emoji or name, optional)", maxLength: 60 },
    { name: "description", label: "Description", type: "textarea", rows: 3, maxLength: 300 },
  ];
  return (
    <CrudManager
      title="Skills" noun="skill" endpoint="/api/admin/skills/" fields={fields} sortable
      defaults={{ name: "", category: "programming", proficiency: 50, icon: "", description: "" }}
      describe={(s) => ({ title: `${s.icon ? s.icon + " " : ""}${s.name}`, subtitle: `${s.category_label} · ${s.proficiency}%` })}
    />
  );
}

export function ExperienceManager() {
  const fields = [
    { name: "job_title", label: "Job title", required: true, maxLength: 160 },
    { name: "company", label: "Company", required: true, maxLength: 160 },
    { name: "location", label: "Location", maxLength: 120 },
    { name: "start_date", label: "Start date", type: "date", required: true },
    { name: "end_date", label: "End date", type: "date", hint: "Leave empty if current" },
    { name: "is_current", label: "I currently work here", type: "checkbox" },
    { name: "description", label: "Description", type: "textarea", rows: 5 },
  ];
  return (
    <CrudManager
      title="Experience" noun="job" endpoint="/api/admin/experience/" fields={fields} sortable
      defaults={{ job_title: "", company: "", location: "", start_date: "", end_date: "", is_current: false, description: "" }}
      describe={(e) => ({ title: `${e.job_title} @ ${e.company}`, subtitle: range(e) })}
    />
  );
}

export function EducationManager() {
  const fields = [
    { name: "degree", label: "Degree", required: true, maxLength: 160 },
    { name: "institution", label: "Institution", required: true, maxLength: 160 },
    { name: "field_of_study", label: "Field of study", maxLength: 160 },
    { name: "location", label: "Location", maxLength: 120 },
    { name: "start_date", label: "Start date", type: "date", required: true },
    { name: "end_date", label: "End date", type: "date", hint: "Leave empty if ongoing" },
    { name: "is_current", label: "Currently studying", type: "checkbox" },
    { name: "description", label: "Description", type: "textarea", rows: 4 },
  ];
  return (
    <CrudManager
      title="Education" noun="education record" endpoint="/api/admin/education/" fields={fields} sortable
      defaults={{ degree: "", institution: "", field_of_study: "", location: "", start_date: "", end_date: "", is_current: false, description: "" }}
      describe={(e) => ({ title: `${e.degree} – ${e.institution}`, subtitle: range(e) })}
    />
  );
}

export function CertificationsManager() {
  const fields = [
    { name: "name", label: "Certification name", required: true, maxLength: 160 },
    { name: "issuer", label: "Issuer", required: true, maxLength: 160 },
    { name: "issue_date", label: "Issue date", type: "date" },
    { name: "expiry_date", label: "Expiry date", type: "date" },
    { name: "credential_id", label: "Credential ID", maxLength: 120 },
    { name: "credential_url", label: "Credential URL", type: "url" },
  ];
  return (
    <CrudManager
      title="Certifications" noun="certification" endpoint="/api/admin/certifications/" fields={fields} sortable
      defaults={{ name: "", issuer: "", issue_date: "", expiry_date: "", credential_id: "", credential_url: "" }}
      describe={(c) => ({ title: c.name, subtitle: `${c.issuer}${c.issue_date ? " · " + fmt(c.issue_date) : ""}` })}
    />
  );
}
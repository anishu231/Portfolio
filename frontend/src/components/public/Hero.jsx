import { useSite } from "../../context/SiteContext";
import { socialList } from "./common";

const AVAIL = {
  available: ["Available for work", "bg-emerald-500"],
  open: ["Open to opportunities", "bg-teal-500"],
  busy: ["Currently unavailable", "bg-amber-500"],
};

export default function Hero() {
  const { profile: p, settings, resume } = useSite();
  const [label, dot] = AVAIL[p.availability_status] || AVAIL.available;
  const links = socialList(p);
  const showResume = settings?.show_resume_button !== false && resume?.url;
  const initials = (p.full_name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <section
      id="home" className="relative overflow-hidden"
      style={p.hero_background ? { backgroundImage: `url("${p.hero_background}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      <div className={`absolute inset-0 ${p.hero_background
        ? "bg-white/85 dark:bg-navy/85"
        : "bg-gradient-to-br from-white via-teal-50 to-white dark:from-navy dark:via-charcoal dark:to-navy"}`} />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1fr_auto] md:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-xs dark:border-line">
            <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
            {label}{p.availability_note ? ` · ${p.availability_note}` : ""}
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-white md:text-5xl">{p.full_name}</h1>
          {p.title && <p className="mt-2 text-lg text-teal-700 dark:text-accent">{p.title}</p>}
          {p.short_intro && <p className="mt-4 max-w-xl text-slate-600 dark:text-slate-300">{p.short_intro}</p>}

          <div className="mt-6 flex flex-wrap gap-3">
            <a className="btn btn-primary" href="#projects">View Projects</a>
            {showResume && <a className="btn btn-ghost" href={resume.url} target="_blank" rel="noreferrer">Download Resume</a>}
            <a className="btn btn-ghost" href="#contact">Contact Me</a>
          </div>

          {links.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-4 text-sm">
              {links.map(([name, url]) => (
                <li key={name + url}>
                  <a href={url} target={url.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer"
                    className="text-slate-600 underline-offset-4 hover:text-teal-700 hover:underline dark:text-slate-400 dark:hover:text-accent">
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="order-first md:order-last">
          {p.profile_picture ? (
            <img src={p.profile_picture} alt={p.full_name}
              className="h-44 w-44 rounded-full border-4 border-white object-cover shadow-lg dark:border-line md:h-60 md:w-60" />
          ) : (
            <div aria-hidden="true"
              className="flex h-44 w-44 items-center justify-center rounded-full border-4 border-white bg-slate-200 text-4xl font-bold text-slate-500 dark:border-line dark:bg-charcoal md:h-60 md:w-60">
              {initials}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
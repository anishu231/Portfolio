import { useSite } from "../../context/SiteContext";
import { EmptyState, Section } from "./common";

export default function About() {
  const { profile: p } = useSite();
  const blocks = [
    ["Summary", p.about_me, true],
    ["Career objective", p.career_objective],
    ["Background & interests", p.background_interests],
  ].filter((b) => b[1]);

  return (
    <Section id="about" title="About Me">
      {blocks.length === 0 ? (
        <EmptyState>About information has not been added yet.</EmptyState>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {blocks.map(([title, text, wide]) => (
            <div key={title} className={`card ${wide ? "md:col-span-2" : ""}`}>
              <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">{title}</h3>
              <p className="whitespace-pre-line leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
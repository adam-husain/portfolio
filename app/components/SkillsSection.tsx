import { siteConfig } from "@/lib/site";

// ============================================================
// SKILLS SECTION
// ============================================================
// SSR-rendered content section (no "use client") so skills are
// present in the static HTML for SEO. Grouped chip lists driven
// from siteConfig.skills.
// ============================================================

const SKILL_GROUPS: { label: string; items: string[] }[] = [
  { label: "Languages", items: siteConfig.skills.languages },
  { label: "Frontend", items: siteConfig.skills.frontend },
  { label: "Mobile", items: siteConfig.skills.mobile },
  { label: "Backend", items: siteConfig.skills.backend },
  { label: "Cloud & DevOps", items: siteConfig.skills.cloud },
  { label: "AI & ML", items: siteConfig.skills.ml },
];

export default function SkillsSection() {
  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="relative bg-background"
    >
      <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        <p className="section-eyebrow mb-4">What I work with</p>
        <h2 id="skills-heading" className="section-heading text-foreground">
          Skills
        </h2>

        <dl className="mt-12 md:mt-16 grid gap-8 sm:grid-cols-2">
          {SKILL_GROUPS.map((group) => (
            <div key={group.label}>
              <dt className="font-utility text-sm tracking-[0.15em] uppercase text-muted-foreground mb-3">
                {group.label}
              </dt>
              <dd>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li key={item} className="tech-chip">
                      {item}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

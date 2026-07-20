import { siteConfig } from "@/lib/site";

// ============================================================
// EDUCATION SECTION
// ============================================================
// SSR-rendered content section, data-driven from
// siteConfig.education.
// ============================================================

export default function EducationSection() {
  return (
    <section
      id="education"
      aria-labelledby="education-heading"
      className="relative bg-background"
    >
      <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        <h2 id="education-heading" className="section-heading text-foreground">
          Education
        </h2>

        <div className="mt-12 divide-y divide-accent/30 md:mt-16">
          {siteConfig.education.map((edu) => (
            <div
              key={edu.degree}
              className="grid gap-2 py-6 md:grid-cols-[11rem_1fr] md:gap-10"
            >
              <div>
                {edu.period && (
                  <p className="font-utility text-sm tracking-[0.15em] uppercase text-primary">
                    {edu.period}
                  </p>
                )}
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {edu.degree}
                  <span className="text-primary"> @ {edu.institution}</span>
                </p>
                {edu.detail && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {edu.detail}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

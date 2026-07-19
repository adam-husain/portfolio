import { siteConfig } from "@/lib/site";

// ============================================================
// EXPERIENCE SECTION
// ============================================================
// SSR-rendered content section (no "use client") so roles are
// present in the static HTML for SEO. Data-driven from
// siteConfig.experience and siteConfig.education.
// ============================================================

export default function ExperienceSection() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="relative bg-background"
    >
      <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        <h2 id="experience-heading" className="section-heading text-foreground">
          Formal work
        </h2>

        <ol className="mt-12 divide-y divide-accent/30 md:mt-16">
          {siteConfig.experience.map((job) => (
            <li
              key={`${job.role}-${job.company}`}
              className="grid gap-2 py-8 md:grid-cols-[11rem_1fr] md:gap-10 md:py-10"
            >
              <div>
                {job.period && (
                  <p className="font-utility text-sm tracking-[0.15em] uppercase text-primary">
                    {job.period}
                  </p>
                )}
                {job.location && (
                  <p className="mt-1 font-utility text-xs tracking-[0.08em] uppercase text-muted">
                    {job.location}
                  </p>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground md:text-2xl">
                  {job.role}
                  <span className="text-primary"> @ {job.company}</span>
                </h3>
                {job.summary && (
                  <p className="mt-3 max-w-2xl text-base text-muted-foreground">
                    {job.summary}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>

        <h3 className="section-subheading mt-16 text-foreground">Education</h3>
        <div className="mt-6 divide-y divide-accent/30">
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

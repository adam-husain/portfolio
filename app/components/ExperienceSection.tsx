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
        <p className="section-eyebrow mb-4">Where I&apos;ve been</p>
        <h2 id="experience-heading" className="section-heading text-foreground">
          Experience
        </h2>

        <ol className="mt-12 md:mt-16 space-y-6">
          {siteConfig.experience.map((job) => (
            <li
              key={`${job.role}-${job.company}`}
              className="relative rounded-xl border border-surface/60 bg-surface/10 p-6 md:p-8 transition-colors hover:border-primary/40"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <h3 className="text-xl md:text-2xl font-semibold text-foreground">
                  {job.role}
                  <span className="text-primary"> @ {job.company}</span>
                </h3>
                {job.period && (
                  <span className="font-utility text-sm tracking-[0.15em] uppercase text-muted-foreground">
                    {job.period}
                  </span>
                )}
              </div>
              {job.location && (
                <p className="mt-1 font-utility text-xs tracking-[0.08em] uppercase text-muted">
                  {job.location}
                </p>
              )}
              {job.summary && (
                <p className="mt-3 max-w-2xl text-base text-muted-foreground">
                  {job.summary}
                </p>
              )}
            </li>
          ))}
        </ol>

        <h3 className="section-subheading mt-16 text-foreground">Education</h3>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {siteConfig.education.map((edu) => (
            <div
              key={edu.degree}
              className="rounded-xl border border-surface/60 bg-surface/10 p-6"
            >
              <p className="text-lg font-semibold text-foreground">
                {edu.degree}
              </p>
              <p className="text-primary">{edu.institution}</p>
              {edu.period && (
                <p className="mt-1 font-utility text-xs tracking-[0.08em] uppercase text-muted">
                  {edu.period}
                </p>
              )}
              {edu.detail && (
                <p className="mt-3 text-sm text-muted-foreground">{edu.detail}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

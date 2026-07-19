import Image from "next/image";
import { siteConfig, type CareerProject } from "@/lib/site";
import Reveal from "./Reveal";

// ============================================================
// CAREER PROJECTS SECTION (the centerpiece)
// ============================================================
// SSR-rendered vertical showcase. Each block hangs off a thin
// ember "filament" timeline with a glowing node and an outlined
// year marker: the one bold visual device on the page. Content
// is fully present in the HTML; the Reveal wrapper only animates
// opacity/translate after hydration.
// ============================================================

function ProjectBlock({ project }: { project: CareerProject }) {
  return (
    <article
      id={project.slug}
      aria-labelledby={`${project.slug}-heading`}
      className="relative pl-8 md:pl-14"
    >
      <span aria-hidden="true" className="filament-node" />

      <Reveal>
        <header className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <span aria-hidden="true" className="year-marker">
            {project.year}
          </span>
          <h3
            id={`${project.slug}-heading`}
            className="section-subheading text-foreground"
          >
            {project.name}
          </h3>
          {project.status && (
            <span className="angled-sep font-utility text-xs tracking-[0.08em] uppercase text-muted-foreground">
              {project.status}
            </span>
          )}
        </header>

        <p className="mt-2 font-utility text-sm tracking-[0.06em] text-primary">
          {project.role}
        </p>

        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        <ul className="tech-list mt-5" aria-label="Technologies">
          {project.technologies.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>

        {project.link && (
          <p className="mt-4">
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-utility text-sm text-primary underline decoration-accent underline-offset-4 transition hover:decoration-primary"
            >
              {project.link.replace("https://", "")}
            </a>
          </p>
        )}
      </Reveal>

      {/* Imagery: hero shot, then dashboards, then a phone strip */}
      <div className="mt-8 space-y-4">
        {project.heroImage && (
          <Reveal>
            <div className="overflow-hidden rounded-xl border border-surface/60 bg-surface/15">
              <Image
                src={project.heroImage.src}
                alt={project.heroImage.alt}
                width={project.heroImage.width}
                height={project.heroImage.height}
                sizes="(max-width: 768px) 100vw, 896px"
                className="w-full"
              />
            </div>
          </Reveal>
        )}

        {project.extraImages && (
          <Reveal>
            <div
              className={`grid gap-4 ${
                project.extraImages.length === 3
                  ? "sm:grid-cols-3"
                  : "sm:grid-cols-2"
              }`}
            >
              {project.extraImages.map((img) => (
                <div
                  key={img.src}
                  className="overflow-hidden rounded-xl border border-surface/60 bg-surface/15"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={img.width}
                    height={img.height}
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {project.mobileImages && (
          <Reveal>
            <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
              {project.mobileImages.map((img) => (
                <div
                  key={img.src}
                  className="w-36 shrink-0 overflow-hidden rounded-xl border border-surface/60 bg-surface/15 sm:w-44"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={img.width}
                    height={img.height}
                    sizes="176px"
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </article>
  );
}

export default function CareerProjectsSection() {
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="relative bg-background"
    >
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <h2 id="work-heading" className="section-heading text-foreground">
          Products I have shipped
        </h2>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          Real products with real users, most of them built end to end by me.
        </p>

        <div className="relative mt-16 md:mt-20">
          <span aria-hidden="true" className="filament" />
          <div className="space-y-24 md:space-y-32">
            {siteConfig.careerProjects.map((project) => (
              <ProjectBlock key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

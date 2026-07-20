"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { siteConfig, type CvProject } from "@/lib/site";

// ============================================================
// CV PROJECTS SECTION
// ============================================================
// The cards use native horizontal scrolling on every device, with
// buttons for stepping through cards when pointer controls are more
// convenient. Card content is SSR'd and stays crawlable.
// ============================================================

function CvProjectCard({ project }: { project: CvProject }) {
  return (
    <article
      aria-labelledby={`${project.slug}-cv-heading`}
      className="flex w-[85vw] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-surface/70 bg-surface/15 sm:w-[420px]"
    >
      {project.images ? (
        <div
          className={`grid h-52 gap-px ${
            project.images.length > 1 ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {project.images.slice(0, 2).map((img) => (
            <Image
              key={img.src}
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              sizes="(max-width: 640px) 42vw, 210px"
              className="h-52 w-full object-cover object-top"
            />
          ))}
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="flex h-52 items-center justify-center border-b border-surface/50"
        >
          <span className="year-marker">{project.year}</span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h3
            id={`${project.slug}-cv-heading`}
            className="section-subheading text-foreground"
          >
            {project.name}
          </h3>
          <span className="font-utility text-sm text-primary">
            {project.year}
          </span>
        </div>
        {project.org && (
          <p className="mt-1 font-utility text-xs tracking-[0.08em] uppercase text-muted">
            {project.org}
          </p>
        )}
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>
        <ul className="tech-list mt-4" aria-label="Technologies">
          {project.technologies.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>
        {project.link && (
          <p className="mt-3">
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-utility text-sm text-primary underline decoration-accent underline-offset-4 transition hover:decoration-primary"
            >
              Visit project
            </a>
          </p>
        )}
      </div>
    </article>
  );
}

export default function CvProjectsSection() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: true });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateScrollState = () => {
      const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
      const next = {
        left: viewport.scrollLeft > 2,
        right: viewport.scrollLeft < maxScrollLeft - 2,
      };

      setCanScroll((current) =>
        current.left === next.left && current.right === next.right
          ? current
          : next
      );
    };

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(viewport);
    viewport.addEventListener("scroll", updateScrollState, { passive: true });
    const frame = requestAnimationFrame(updateScrollState);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      viewport.removeEventListener("scroll", updateScrollState);
    };
  }, []);

  const scrollCards = (direction: -1 | 1) => {
    const viewport = viewportRef.current;
    const track = viewport?.firstElementChild;
    const firstCard = track?.firstElementChild;
    if (!viewport || !(track instanceof HTMLElement) || !firstCard) return;

    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const distance = firstCard.getBoundingClientRect().width + gap;

    viewport.scrollBy({
      left: direction * distance,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  return (
    <section
      id="more-projects"
      aria-labelledby="more-projects-heading"
      className="relative overflow-hidden border-y border-accent/30 bg-background"
    >
      <div className="flex min-h-svh flex-col justify-center py-24">
        <div className="mx-auto flex w-full max-w-6xl items-end justify-between gap-6 px-6">
          <h2
            id="more-projects-heading"
            className="section-heading text-foreground"
          >
            Projects along the way
          </h2>

          <div className="flex shrink-0 gap-3" aria-label="Project navigation">
            <button
              type="button"
              aria-label="Previous project"
              aria-controls="more-projects-scroller"
              disabled={!canScroll.left}
              onClick={() => scrollCards(-1)}
              className="flex size-11 items-center justify-center rounded-full border border-primary/60 text-primary transition-[color,background-color,opacity] hover:bg-primary hover:text-background disabled:pointer-events-none disabled:opacity-0"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next project"
              aria-controls="more-projects-scroller"
              disabled={!canScroll.right}
              onClick={() => scrollCards(1)}
              className="flex size-11 items-center justify-center rounded-full border border-primary/60 text-primary transition-[color,background-color,opacity] hover:bg-primary hover:text-background disabled:pointer-events-none disabled:opacity-0"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        <div className="relative ml-auto mt-12 w-full md:max-w-[calc((100vw+72rem)/2)] md:mt-16">
          <div
            id="more-projects-scroller"
            ref={viewportRef}
            className="snap-x snap-mandatory overflow-x-auto overflow-y-hidden pb-4 [scrollbar-color:var(--color-accent)_transparent] [scrollbar-width:thin]"
          >
            <div className="flex w-max gap-6 px-6">
              {siteConfig.cvProjects.map((project) => (
                <CvProjectCard key={project.slug} project={project} />
              ))}
            </div>
          </div>

          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 left-0 w-16 bg-[linear-gradient(to_right,var(--color-background),transparent)] transition-opacity duration-300 md:w-28 ${
              canScroll.left ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 right-0 w-16 bg-[linear-gradient(to_left,var(--color-background),transparent)] transition-opacity duration-300 md:w-28 ${
              canScroll.right ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      </div>
    </section>
  );
}

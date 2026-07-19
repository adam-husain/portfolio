"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { siteConfig, type CvProject } from "@/lib/site";
import { gsap, ScrollTrigger } from "../lib/gsap";

// ============================================================
// CV PROJECTS SECTION (horizontal scroll)
// ============================================================
// On desktop with a fine pointer and no reduced-motion setting,
// the section pins and the card track translates horizontally,
// driven by vertical scroll. Everywhere else the exact same
// markup is a native overflow-x snap scroller, so touch devices
// never get their scroll hijacked. Card content is SSR'd (client
// components still server-render HTML) and stays crawlable.
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
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      "(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      () => {
        const section = sectionRef.current;
        const viewport = viewportRef.current;
        const track = trackRef.current;
        if (!section || !viewport || !track) return;

        viewport.dataset.pinned = "true";
        const dist = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
        // Pin for 2.5x the horizontal travel so the section scrolls
        // slowly enough to read each card instead of sweeping past.
        const SCROLL_STRETCH = 2.5;

        gsap.to(track, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${Math.round(dist() * SCROLL_STRETCH)}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        return () => {
          delete viewport.dataset.pinned;
        };
      }
    );

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="more-projects"
      aria-labelledby="more-projects-heading"
      className="relative overflow-hidden border-y border-accent/30 bg-background"
    >
      <div className="flex min-h-svh flex-col justify-center py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <h2
            id="more-projects-heading"
            className="section-heading text-foreground"
          >
            Projects along the way
          </h2>
        </div>

        <div
          ref={viewportRef}
          className="mt-12 snap-x snap-mandatory overflow-x-auto pb-4 [scrollbar-width:thin] data-[pinned=true]:snap-none data-[pinned=true]:overflow-hidden md:mt-16"
        >
          <div
            ref={trackRef}
            className="flex w-max gap-6 px-6 will-change-transform md:px-[max(1.5rem,calc((100vw-72rem)/2))]"
          >
            {siteConfig.cvProjects.map((project) => (
              <CvProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

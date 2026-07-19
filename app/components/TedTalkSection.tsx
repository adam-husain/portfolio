"use client";

import { useState } from "react";
import Image from "next/image";
import { siteConfig } from "@/lib/site";

// ============================================================
// TED TALK SECTION
// ============================================================
// Lite YouTube embed: a self-hosted thumbnail with a play button
// that swaps in the iframe only on click, so no third-party bytes
// load with the page. A plain external link is always rendered as
// a no-JS/SEO fallback.
// ============================================================

export default function TedTalkSection() {
  const [playing, setPlaying] = useState(false);
  const talk = siteConfig.tedTalk;

  return (
    <section
      id="ted-talk"
      aria-labelledby="ted-talk-heading"
      className="relative bg-background"
    >
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="section-eyebrow mb-4">On stage</p>
            <h2 id="ted-talk-heading" className="section-heading text-foreground">
              TEDx Talk
            </h2>
            <p className="mt-2 font-utility text-sm tracking-[0.06em] text-primary">
              {talk.event} &middot; September 2022
            </p>
            <h3 className="section-subheading mt-6 text-foreground">
              {talk.title}
            </h3>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              {talk.description}
            </p>
            <p className="mt-6">
              <a
                href={talk.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-utility text-sm text-primary underline decoration-accent underline-offset-4 transition hover:decoration-primary"
              >
                Watch on YouTube
              </a>
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-surface/70 bg-surface/15">
            {playing ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${talk.youtubeId}?autoplay=1`}
                title={talk.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full"
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label={`Play: ${talk.title}`}
                className="group relative block w-full cursor-pointer"
              >
                <Image
                  src="/images/ted-thumbnail.jpg"
                  alt={`Adam Husain speaking at ${talk.event}`}
                  width={1280}
                  height={720}
                  sizes="(max-width: 768px) 100vw, 560px"
                  className="w-full transition group-hover:brightness-110"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-secondary shadow-[0_0_40px_rgba(246,170,28,0.45)] transition group-hover:scale-105">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="ml-1 h-7 w-7"
                    >
                      <path d="M8 5.14v13.72L19 12 8 5.14z" />
                    </svg>
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

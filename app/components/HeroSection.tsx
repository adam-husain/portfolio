import Image from "next/image";
import { siteConfig } from "@/lib/site";

// ============================================================
// HERO SECTION
// ============================================================
// SSR-rendered. Poster-style composition: an oversized display
// name whose second line slides underneath the cutout portrait,
// which overflows the container's right edge and sits on the
// section's bottom border. The only gradient on the page is the
// soft ember glow behind the photo. The portrait layer is
// pointer-events-none so it never blocks links.
// ============================================================

export default function HeroSection() {
  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="relative flex min-h-svh flex-col justify-end overflow-hidden border-b border-accent/30"
    >
      <div className="relative mx-auto w-full max-w-6xl px-6 pt-28 pb-10 md:pb-20">
        {/* Copy */}
        <div className="relative z-0">
          <p className="section-eyebrow mb-6">{siteConfig.greeting}</p>
          <h1 className="font-display text-[clamp(4rem,2rem+10.5vw,12.5rem)] leading-[0.9] font-bold tracking-[-0.03em] text-foreground">
            Adam
            <span className="block md:pl-[18%]">Husain</span>
          </h1>
          <p className="mt-8 font-utility text-sm tracking-[0.2em] uppercase text-primary">
            {siteConfig.tagline}
          </p>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Building software for 8+ years, from my first client in 2017 to
            leading engineering teams and co-founding startups. My expertise is
            data science and machine learning, and my guiding philosophy is
            simple:{" "}
            <em className="box-decoration-clone rounded-sm bg-accent/35 px-1.5 py-0.5 font-medium not-italic">
              build software that positively impacts people&apos;s lives
            </em>
            .
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#work"
              className="rounded-lg bg-primary px-6 py-3 text-base font-semibold text-secondary transition hover:brightness-95"
            >
              See the work
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-accent px-6 py-3 text-base font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              R&eacute;sum&eacute;
            </a>
          </div>
        </div>

        {/* Portrait: overflows the right edge, overlaps the title tail,
            bottom glued to the section border */}
        <div className="pointer-events-none relative z-10 mt-4 -mr-10 ml-auto w-[78vw] max-w-[360px] translate-y-4 sm:-mt-10 md:absolute md:bottom-0 md:-right-12 md:mt-0 md:w-[48vw] md:max-w-[620px] md:translate-y-8 lg:-right-20">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 mx-auto h-[70%] w-[85%] rounded-full bg-[radial-gradient(circle,rgba(246,170,28,0.26)_0%,rgba(148,27,12,0.16)_45%,transparent_70%)] blur-2xl"
          />
          <Image
            src="/images/mine/adam-hero.png"
            alt="Adam Husain, waist-up portrait"
            width={896}
            height={1195}
            priority
            sizes="(max-width: 768px) 78vw, 48vw"
            className="relative w-full"
          />
        </div>
      </div>

    </section>
  );
}

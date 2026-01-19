import Image from "next/image";
import EyeTrackerBall from "./components/EyeTrackerBall";
import CloudAtmosphere from "./components/CloudAtmosphere";
import AnimatedName from "./components/AnimatedName";
import MoonReveal from "./components/MoonReveal";
import { siteConfig } from "@/lib/site";

export default function Home() {
  const [role1, role2] = siteConfig.tagline.split(" | ");

  return (
    <>
      <section
        className="relative min-h-screen min-h-dvh flex items-center justify-center overflow-hidden"
        aria-label="Introduction"
      >
        {/* Animated star background */}
        <div className="absolute inset-0 bg-background" aria-hidden="true">
          {/* Gradient: pitch black to dark gray */}
          <div className="absolute inset-0 bg-gradient-to-b from-black to-zinc-800" />
          <div className="stars-small absolute inset-0 bg-repeat animate-twinkle" />
          <div className="stars-medium absolute inset-0 bg-repeat animate-twinkle-delayed" />
          <div className="stars-large absolute inset-0 bg-repeat animate-twinkle-slow" />
        </div>

        {/* Main content */}
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-[90vw] mb-[23%]!">
          <p className="text-white text-xl! tracking-[0.2em] uppercase mb-6! font-medium">
            {siteConfig.greeting}
          </p>
          <h1 className="mb-4">
            <AnimatedName />
          </h1>
          <p className="text-muted-foreground! text-xl! font-normal flex flex-col sm:flex-row flex-wrap items-center justify-center gap-1 sm:gap-2 mt-6!">
            <span>{role1}</span>
            <span className="hidden sm:inline text-primary/60" aria-hidden="true">|</span>
            <span>{role2}</span>
          </p>
        </div>
      </section>

      {/* Scroll-driven moon reveal with curved mask */}
      <MoonReveal />

      {/* Volumetric clouds around the face */}
      {/* <CloudAtmosphere /> */}

      {/* My face that tracks my eye. Positioned at bottom, half visible */}
      <div
        className="absolute bottom-0 left-1/2 z-20 pointer-events-none"
        style={{
          transform: "translateX(-50%) translateY(35%)",
          height: "min(100vh, 140vw)",
          aspectRatio: "550 / 800",
        }}
      >
        <EyeTrackerBall />
      </div>
      
      {/* Moon section */}
      <section
        id="moon-section"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Zoomed moon: 150vw or 150vh, whichever is larger */}
        <div
          className="absolute bottom-0 left-1/2 pointer-events-none"
          style={{
            width: "max(150vw, 150vh)",
            height: "max(150vw, 150vh)",
            transform: "translateX(-50%) translateY(50%)",
          }}
        >
          <Image
            src="/images/moon.webp"
            alt="Moon surface"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* Noscript fallback for SEO */}
      <noscript>
        <div className="noscript-content">
          <h1>{siteConfig.name}</h1>
          <p>{siteConfig.tagline}</p>
          <p>{siteConfig.description}</p>
        </div>
      </noscript>
    </>
  );
}

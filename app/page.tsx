import EyeTrackerBall from "./components/EyeTrackerBall";
import CloudAtmosphere from "./components/CloudAtmosphere";
import AnimatedName from "./components/AnimatedName";
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
          <div className="stars-small absolute inset-0 bg-repeat animate-twinkle" />
          <div className="stars-medium absolute inset-0 bg-repeat animate-twinkle-delayed" />
          <div className="stars-large absolute inset-0 bg-repeat animate-twinkle-slow" />
        </div>

        {/* Main content */}
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-[90vw] mb-[15vh] sm:mb-[18vh] lg:mb-[20vh]">
          <p className="text-white text-sm sm:text-base lg:text-lg tracking-[0.2em] uppercase mb-3 font-medium">
            {siteConfig.greeting}
          </p>
          <h1 className="mb-4">
            <AnimatedName />
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg lg:text-xl font-normal flex flex-col sm:flex-row flex-wrap items-center justify-center gap-1 sm:gap-2">
            <span>{role1}</span>
            <span className="hidden sm:inline text-primary/60" aria-hidden="true">|</span>
            <span>{role2}</span>
          </p>
        </div>
      </section>

      {/* Volumetric clouds around the face */}
      <CloudAtmosphere />

      {/* My face that tracks my eye. Positioned at bottom, half visible */}
      <EyeTrackerBall />

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

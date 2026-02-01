import AnimatedName from "./components/AnimatedName";
import Rocket3D from "./components/Rocket3D";
import MoonReveal from "./components/MoonReveal";
import Satellite3D from "./components/Satellite3D";
import ReentrySection from "./components/ReentrySection";
import CloudscapeSection from "./components/CloudscapeSection";
import CityscapeSection from "./components/CityscapeSection";
import FooterSection from "./components/FooterSection";
import MyFace from "./components/MyFace";
import ParallaxBackground from "./components/ParallaxBackground";
import CloudAtmosphere from "./components/CloudAtmosphere";
import ScrollNormalizer from "./components/ScrollNormalizer";
import { siteConfig } from "@/lib/site";

export default function Home() {
  const [role1, role2] = siteConfig.tagline.split(" | ");

  return (
    <>
      {/* Normalize scroll for Windows Precision Touchpad compatibility */}
      <ScrollNormalizer />

      {/* Parallax starry background that transitions to blue sky */}
      <ParallaxBackground />

      <section
        className="relative min-h-screen min-h-dvh flex items-center justify-center overflow-hidden"
        aria-label="Introduction"
      >
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
            <span
              className="hidden sm:inline text-primary/60"
              aria-hidden="true"
            >
              |
            </span>
            <span>{role2}</span>
          </p>
        </div>
      </section>

      {/* 3D Rocket flying from section 1 to section 2 */}
      <Rocket3D />

      {/* Scroll-driven moon reveal with curved mask */}
      <MoonReveal />

      {/* Volumetric clouds around the balloon in section 4 */}
      <CloudAtmosphere />

      {/* My face that tracks my eye. Positioned at bottom, half visible */}
      <div
        className="absolute bottom-0 left-1/2 z-[15] pointer-events-none"
        style={{
          transform: "translateX(-50%) translateY(35%)",
          height: "min(100vh, 140vw)",
          aspectRatio: "550 / 800",
        }}
      >
        <MyFace />
      </div>

      {/* Moon section */}
      <section
        id="moon-section"
        className="relative min-h-[150vh] flex items-center justify-center overflow-hidden"
      ></section>

      {/* 3D Satellite flying across section 3 */}
      <Satellite3D />

      {/* Satellite section */}
      <section
        id="satellite-section"
        className="relative h-[150vh] flex items-start justify-center overflow-hidden"
      ></section>

      {/* Section 4: Atmospheric Re-entry with asteroids and hot air balloon */}
      <ReentrySection />

      {/* Section 5: Cloudscape - Stillness (balloon scales down, clouds prominent) */}
      <CloudscapeSection />

      {/* Section 6: Cityscape - Arrival (futuristic skyline emerges) */}
      <CityscapeSection />

      {/* Footer: Contact form and social links */}
      <FooterSection />

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

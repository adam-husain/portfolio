"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { updateSection5Progress, useScrollProgress, mapRange } from "@/app/lib/scrollProgress";

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// SECTION 5: CLOUDSCAPE — STILLNESS
// ============================================================
// Visual elements:
// - Hot air balloon scales down (continues from Section 4)
// - Volumetric clouds become more prominent
// - Soft parallax layering
// - Calm atmosphere after the intensity of re-entry
//
// Text: "Sometimes you need to slow down to see clearly"
//
// NOTE: The balloon from ReentrySection should scale down here.
// CloudAtmosphere persists from Section 4 into this section.
// ============================================================

export default function CloudscapeSection() {
  const textRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);
  const section6ProgressRef = useRef(0);

  // Subscribe to section 6 progress for text fade-out
  const { section6 } = useScrollProgress();

  // Keep section6 ref in sync and update text opacity when section6 changes
  useEffect(() => {
    section6ProgressRef.current = section6;

    // When section 6 is scrolling, manually update text fade-out
    // (Section 5's ScrollTrigger onUpdate won't fire when we're in Section 6)
    if (textRef.current && section6 > 0) {
      const section6FadeOut = 1 - mapRange(section6, 0.1, 0.4);
      // Text should be fully faded in at this point (section 5 complete)
      textRef.current.style.opacity = String(section6FadeOut);
    }
  }, [section6]);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: "#cloudscape-section",
      start: "top bottom",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;
        updateSection5Progress(self.progress);

        // Text animation: fade in from 0.3 to 0.6 progress
        if (textRef.current) {
          const textProgress = Math.max(0, Math.min(1, (self.progress - 0.3) / 0.3));
          const easedFadeIn = 1 - Math.pow(1 - textProgress, 2);

          // Fade out when entering section 6 (0.1 to 0.4 of section 6 progress)
          const section6FadeOut = 1 - mapRange(section6ProgressRef.current, 0.1, 0.4);

          // Final opacity is fade-in multiplied by fade-out
          const finalOpacity = easedFadeIn * section6FadeOut;

          textRef.current.style.opacity = String(finalOpacity);
          textRef.current.style.transform = `translateY(calc(-50% + ${(1 - easedFadeIn) * 40}px))`;
        }
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <>
      {/* Section trigger */}
      <section
        id="cloudscape-section"
        className="relative h-[150vh] flex items-center justify-center overflow-hidden"
        aria-label="Cloudscape - Stillness"
      />

      {/* Text overlay */}
      <div
        ref={textRef}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black text-center z-[40] pointer-events-none px-4"
        style={{ opacity: 0, transform: "translateY(calc(-50% + 40px))" }}
      >
        <h2
          className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4"
        >
          Open up your mind to the 
          <br />
           endless possibilities
        </h2>
      </div>
    </>
  );
}

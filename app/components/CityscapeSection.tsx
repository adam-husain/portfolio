"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { updateSection6Progress } from "@/app/lib/scrollProgress";

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// SECTION 6: CITYSCAPE — ARRIVAL
// ============================================================
// Visual elements:
// - Futuristic skyline emerges from clouds
// - Neon lights and geometric buildings
// - Journey's end - arrival at destination
//
// Text: "Every descent has a destination"
//
// Design notes:
// - Skyline should appear to rise from below the clouds
// - Use city silhouette with glowing windows/lights
// - Color scheme: deep blues with neon accents (primary #fca311)
// - Buildings could have subtle parallax depth
// ============================================================

export default function CityscapeSection() {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: "#cityscape-section",
      start: "top bottom",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        updateSection6Progress(self.progress);

        // Text animation: fade in from 0.4 to 0.7 progress
        if (textRef.current) {
          const textProgress = Math.max(0, Math.min(1, (self.progress - 0.4) / 0.3));
          const easedText = 1 - Math.pow(1 - textProgress, 2);
          textRef.current.style.opacity = String(easedText);
          textRef.current.style.transform = `translateY(${(1 - easedText) * 30}px)`;
        }
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <section
      id="cityscape-section"
      className="relative min-h-screen flex flex-col justify-end overflow-hidden"
      aria-label="Cityscape - Arrival"
    >
      {/* Text overlay */}
      <div
        ref={textRef}
        className="absolute left-1/2 -translate-x-1/2 text-white text-center z-10 pointer-events-none px-4"
        style={{
          opacity: 0,
          transform: "translateY(30px)",
          bottom: "calc(34.66vw + 5vh)",
        }}
      >
        <h2
          className="text-3xl md:text-3xl lg:text-4xl font-bold tracking-tight"
          style={{
            textShadow:
              "2px 2px 4px rgba(0,0,0,0.9), 0 0 30px rgba(252, 163, 17, 0.3)",
          }}
        >
          Have you decided to look <span className="text-primary">cool</span>
        </h2>
      </div>

      {/* City SVG container - static at bottom, fills width */}
      <div className="relative w-full z-0 overflow-hidden">
        <img
          src="/images/city.svg"
          alt="Futuristic cityscape"
          className="block w-full h-auto"
          style={{
            transform: "scale(1.05) translateX(-2%) translateY(5px)",
            transformOrigin: "center bottom",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 60%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 60%)",
          }}
        />
      </div>
    </section>
  );
}

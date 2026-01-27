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

// Predetermined building configurations for SSR compatibility (no Math.random)
const BUILDING_CONFIG = [
  { height: 45, width: 28, windows: [0.7, 0.4, 0, 0.8] },
  { height: 72, width: 35, windows: [0.9, 0.3, 0.6, 0, 0.5, 0.8, 0.4] },
  { height: 38, width: 22, windows: [0.5, 0.7, 0, 0.6] },
  { height: 85, width: 42, windows: [0.8, 0.4, 0.7, 0.3, 0.9, 0, 0.5, 0.6] },
  { height: 55, width: 30, windows: [0.6, 0, 0.8, 0.5, 0.3] },
  { height: 68, width: 38, windows: [0.4, 0.7, 0.5, 0.9, 0, 0.6] },
  { height: 92, width: 48, windows: [0.9, 0.5, 0.7, 0, 0.8, 0.4, 0.6, 0.3, 0.7] },
  { height: 60, width: 32, windows: [0.3, 0.8, 0.5, 0.7, 0, 0.6] },
  { height: 78, width: 40, windows: [0.7, 0.4, 0.9, 0.5, 0, 0.8, 0.3] },
  { height: 42, width: 25, windows: [0.6, 0, 0.5, 0.8] },
  { height: 65, width: 36, windows: [0.8, 0.5, 0.3, 0.7, 0.9, 0] },
  { height: 88, width: 45, windows: [0.5, 0.7, 0, 0.9, 0.4, 0.6, 0.8, 0.3] },
  { height: 50, width: 28, windows: [0.7, 0.3, 0.6, 0.9, 0] },
  { height: 70, width: 38, windows: [0.4, 0.8, 0.5, 0, 0.7, 0.6] },
  { height: 35, width: 24, windows: [0.9, 0.5, 0, 0.7] },
];

export default function CityscapeSection() {
  const textRef = useRef<HTMLDivElement>(null);
  const skylineRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: "#cityscape-section",
      start: "top bottom",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;
        updateSection6Progress(self.progress);

        // Skyline rises up: starts below viewport, rises to position
        if (skylineRef.current) {
          const skylineProgress = Math.min(1, self.progress / 0.6);
          const easedSkyline = 1 - Math.pow(1 - skylineProgress, 3);
          // Move from 100% (below) to 0% (in place)
          skylineRef.current.style.transform = `translateY(${(1 - easedSkyline) * 100}%)`;
          skylineRef.current.style.opacity = String(easedSkyline);
        }

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
    <>
      {/* Section trigger */}
      <section
        id="cityscape-section"
        className="relative h-[150vh] flex items-center justify-center overflow-hidden"
        aria-label="Cityscape - Arrival"
      />

      {/* Skyline placeholder */}
      <div
        ref={skylineRef}
        className="fixed bottom-0 left-0 right-0 h-[40vh] z-[38] pointer-events-none"
        style={{ opacity: 0, transform: "translateY(100%)" }}
      >
        {/*
          TODO: Replace with actual cityscape visuals
          Options:
          1. SVG skyline silhouette with CSS animations for lights
          2. Image-based skyline with parallax layers
          3. 3D cityscape with React Three Fiber
        */}

        {/* Placeholder skyline gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top,
              rgba(0, 8, 20, 1) 0%,
              rgba(0, 8, 20, 0.95) 20%,
              rgba(0, 8, 20, 0.7) 50%,
              transparent 100%)`,
          }}
        />

        {/* Placeholder building silhouettes - predetermined values for SSR compatibility */}
        <div className="absolute bottom-0 left-0 right-0 h-[60%] flex items-end justify-center gap-1 md:gap-2 px-4">
          {/* Building shapes - replace with actual skyline */}
          {BUILDING_CONFIG.map((building, i) => (
            <div
              key={i}
              className="bg-secondary/80 rounded-t-sm relative"
              style={{
                height: `${building.height}%`,
                width: `${building.width}px`,
                minWidth: "15px",
              }}
            >
              {/* Window lights */}
              <div className="absolute inset-1 grid grid-cols-2 gap-0.5">
                {building.windows.map((opacity, j) => (
                  <div
                    key={j}
                    className="bg-primary/30"
                    style={{ opacity }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Text overlay */}
      <div
        ref={textRef}
        className="fixed bottom-[45vh] left-1/2 -translate-x-1/2 text-white text-center z-[42] pointer-events-none px-4"
        style={{ opacity: 0, transform: "translateY(30px)" }}
      >
        <h2
          className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight"
          style={{
            textShadow:
              "2px 2px 4px rgba(0,0,0,0.9), 0 0 30px rgba(252, 163, 17, 0.3)",
          }}
        >
          Every descent has a <span className="text-primary">destination</span>
        </h2>
      </div>

      {/*
        TODO: Implement full cityscape visuals
        - Detailed skyline silhouette (SVG or image)
        - Animated neon signs
        - Parallax building layers (front/back)
        - Glowing windows with subtle animation
        - Light pollution glow effect at horizon
        - Flying vehicles or particles for atmosphere
      */}
    </>
  );
}

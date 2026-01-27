"use client";

import { useEffect, useRef } from "react";

// Configuration for parallax layers
// REVERSE PARALLAX: negative values = stars move UP when scrolling DOWN
// This creates the illusion of descending through space
const PARALLAX_CONFIG = {
  smallStars: -0.08,   // Slowest - far away (barely moves)
  mediumStars: -0.12,  // Medium distance
  largeStars: -0.18,   // Closest stars - move slightly more
};

// Color transition points (based on total scroll progress)
const COLOR_CONFIG = {
  // Pitch black space at the top
  spaceStart: { r: 0, g: 0, b: 0 },
  // Dark navy blue (atmospheric entry)
  midSky: { r: 0, g: 8, b: 20 },
  // Dawn blue (near earth)
  earthSky: { r: 25, g: 55, b: 109 },
  // Transition timing (0-1 based on total page scroll)
  transitionStart: 0.4,  // Start transitioning after 40% scroll
  transitionEnd: 0.85,   // Fully transitioned by 85% scroll
};

export default function ParallaxBackground() {
  const smallStarsRef = useRef<HTMLDivElement>(null);
  const mediumStarsRef = useRef<HTMLDivElement>(null);
  const largeStarsRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const starMaskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Calculate total page height for progress calculations
    const calculateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      return docHeight > 0 ? scrollTop / docHeight : 0;
    };

    // Smoothly interpolate colors
    const lerpColor = (
      start: { r: number; g: number; b: number },
      end: { r: number; g: number; b: number },
      t: number
    ) => ({
      r: Math.round(start.r + (end.r - start.r) * t),
      g: Math.round(start.g + (end.g - start.g) * t),
      b: Math.round(start.b + (end.b - start.b) * t),
    });

    const handleScroll = () => {
      const progress = calculateProgress();
      const scrollY = window.scrollY;

      // Apply REVERSE parallax to star layers (stars move opposite to scroll)
      if (smallStarsRef.current) {
        smallStarsRef.current.style.transform = `translateY(${scrollY * PARALLAX_CONFIG.smallStars}px)`;
      }
      if (mediumStarsRef.current) {
        mediumStarsRef.current.style.transform = `translateY(${scrollY * PARALLAX_CONFIG.mediumStars}px)`;
      }
      if (largeStarsRef.current) {
        largeStarsRef.current.style.transform = `translateY(${scrollY * PARALLAX_CONFIG.largeStars}px)`;
      }

      // Calculate color transition
      if (gradientRef.current) {
        let bgColor: { r: number; g: number; b: number };

        if (progress < COLOR_CONFIG.transitionStart) {
          // Pure space black
          bgColor = COLOR_CONFIG.spaceStart;
        } else if (progress >= COLOR_CONFIG.transitionEnd) {
          // Full earth sky blue
          bgColor = COLOR_CONFIG.earthSky;
        } else {
          // Transitioning
          const transitionProgress =
            (progress - COLOR_CONFIG.transitionStart) /
            (COLOR_CONFIG.transitionEnd - COLOR_CONFIG.transitionStart);

          // Ease the transition
          const eased = 1 - Math.pow(1 - transitionProgress, 2);

          // Two-phase color transition: black -> navy -> blue
          if (eased < 0.5) {
            const phase1 = eased * 2;
            bgColor = lerpColor(COLOR_CONFIG.spaceStart, COLOR_CONFIG.midSky, phase1);
          } else {
            const phase2 = (eased - 0.5) * 2;
            bgColor = lerpColor(COLOR_CONFIG.midSky, COLOR_CONFIG.earthSky, phase2);
          }
        }

        gradientRef.current.style.background = `linear-gradient(to bottom,
          rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b}) 0%,
          rgb(${Math.min(255, bgColor.r + 20)}, ${Math.min(255, bgColor.g + 20)}, ${Math.min(255, bgColor.b + 30)}) 100%)`;

        // Fade stars as we approach earth (they become less visible in daylight)
        const starFade = progress > COLOR_CONFIG.transitionStart
          ? Math.max(0, 1 - (progress - COLOR_CONFIG.transitionStart) / (COLOR_CONFIG.transitionEnd - COLOR_CONFIG.transitionStart))
          : 1;

        if (smallStarsRef.current) smallStarsRef.current.style.opacity = String(starFade);
        if (mediumStarsRef.current) mediumStarsRef.current.style.opacity = String(starFade);
        if (largeStarsRef.current) largeStarsRef.current.style.opacity = String(starFade * 0.9);
      }
    };

    // Initial call
    handleScroll();

    // Use passive listener for better scroll performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      {/* Base gradient background */}
      <div
        ref={gradientRef}
        className="absolute inset-0 transition-colors duration-100"
        style={{ background: "linear-gradient(to bottom, rgb(0,0,0) 0%, rgb(20,20,30) 100%)" }}
      />

      {/* Star container with density mask - stars fade out toward bottom */}
      <div
        ref={starMaskRef}
        className="absolute inset-0 overflow-hidden"
        style={{
          // Mask: full opacity at top, fading to transparent at bottom
          // This reduces star density as you descend
          maskImage: "linear-gradient(to bottom, black 0%, black 30%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.2) 75%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 30%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.2) 75%, transparent 100%)",
        }}
      >
        {/* Star layers with reverse parallax */}
        <div
          ref={smallStarsRef}
          className="stars-small absolute inset-0 bg-repeat animate-twinkle will-change-transform"
          style={{ height: "150%" }}
        />
        <div
          ref={mediumStarsRef}
          className="stars-medium absolute inset-0 bg-repeat animate-twinkle-delayed will-change-transform"
          style={{ height: "150%" }}
        />
        <div
          ref={largeStarsRef}
          className="stars-large absolute inset-0 bg-repeat animate-twinkle-slow will-change-transform"
          style={{ height: "150%" }}
        />
      </div>
    </div>
  );
}

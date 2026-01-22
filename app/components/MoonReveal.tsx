"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Moon transform positions
const MOON_START_Y = 55; // Start position (% translateY)
const MOON_END_Y = 50;   // End position (% translateY)

export default function MoonReveal() {
  const maskRef = useRef<HTMLDivElement>(null);
  const moonRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mask = maskRef.current;
    const moon = moonRef.current;
    const glow = glowRef.current;
    const text = textRef.current;

    if (!mask || !moon || !glow) return;

    // Helper functions for interpolation
    const lerp = (start: number, end: number, p: number) => start + (end - start) * p;
    const mapRange = (p: number, min: number, max: number) =>
      Math.max(0, Math.min(1, (p - min) / (max - min)));

    // Single ScrollTrigger - scrub: true for instant response (no delay)
    const trigger = ScrollTrigger.create({
      trigger: "#moon-section",
      start: "top bottom",
      end: "top top",
      scrub: true, // Instant 1:1 scroll response - maximum responsiveness
      onUpdate: (self) => {
        const p = self.progress;

        // Mask: 0% → 120%
        mask.style.setProperty("--mask-progress", `${lerp(0, 120, p)}%`);

        // Moon: yPercent and brightness
        const yPercent = lerp(MOON_START_Y, MOON_END_Y, p);
        const brightness = lerp(1, 0.5, p);
        moon.style.transform = `translateX(-50%) translateY(${yPercent}%)`;
        moon.style.filter = `brightness(${brightness})`;

        // Glow: opacity with easeOut, and glow-y position
        const easedP = 1 - Math.pow(1 - p, 2); // power2.out equivalent
        const glowY = lerp(100, 30, easedP);
        glow.style.opacity = String(easedP);
        glow.style.setProperty("--glow-y", `${glowY}%`);

        // Text: mapped to 50%-80% scroll range
        if (text) {
          const textP = mapRange(p, 0.5, 0.8);
          const easedTextP = 1 - Math.pow(1 - textP, 2); // power2.out equivalent
          const textY = lerp(30, 0, easedTextP);
          text.style.opacity = String(easedTextP);
          text.style.transform = `translateY(${textY}px)`;
        }
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <>
      {/* Glow effect ABOVE the masked moon - visible on intro section */}
      <div
        ref={glowRef}
        className="fixed inset-x-0 bottom-[-10vh]! z-[19] pointer-events-none"
        style={
          {
            "--glow-y": "100%",
            height: "110vh",
            opacity: 0,
            background:
              "radial-gradient(ellipse 200% 80% at 50% var(--glow-y), rgba(255,255,255,0.3) 0%, rgba(220,240,255,0.2) 10%, rgba(180,210,255,0.12) 25%, rgba(140,180,255,0.06) 40%, rgba(100,150,255,0.02) 55%, transparent 75%)",
          } as React.CSSProperties
        }
        aria-hidden="true"
      />

      {/* Masked moon container */}
      <div
        ref={maskRef}
        className="fixed inset-0 z-[20] pointer-events-none overflow-hidden"
        style={
          {
            "--mask-progress": "0%",
            clipPath: "ellipse(100% var(--mask-progress) at 50% 100%)",
          } as React.CSSProperties
        }
      >
        {/* Moon image matching the section moon position */}
        <div
          ref={moonRef}
          className="fixed bottom-0 left-1/2"
          style={{
            width: "max(150vw, 150vh)",
            height: "max(150vw, 150vh)",
          }}
        >
          <Image
            src="/images/moon.webp"
            alt=""
            fill
            className="object-cover"
            aria-hidden="true"
            priority
            unoptimized
          />
        </div>

        {/* Embossed text overlay */}
        <div
          ref={textRef}
          className="fixed top-1/2 left-8 md:left-16 lg:left-24 -translate-y-1/2 max-w-lg text-white"
          style={{ opacity: 0 }}
        >
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
            style={{
              textShadow:
                "2px 2px 4px rgba(0,0,0,0.8), -1px -1px 0 rgba(255,255,255,0.1), 0 0 40px rgba(255,255,255,0.2)",
            }}
          >
            A good design is
            <br />
            not rocket science
          </h2>
          <p
            className="text-base md:text-lg lg:text-xl text-white/80 leading-relaxed"
            style={{
              textShadow: "1px 1px 3px rgba(0,0,0,0.9)",
            }}
          >
            But a rocket sure helps with making it look cool.
          </p>
        </div>
      </div>
    </>
  );
}

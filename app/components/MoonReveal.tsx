"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useScrollProgress } from "@/app/lib/scrollProgress";
import { SECTION2_TIMING, SECTION3_TIMING, calculateFadeOut } from "@/app/lib/animationTiming";

gsap.registerPlugin(ScrollTrigger);

// Moon configuration (using timing config)
const CONFIG = {
  section2: {
    startYPercent: SECTION2_TIMING.moon.startYPercent,
    endYPercent: SECTION2_TIMING.moon.endYPercent,
    startBrightness: SECTION2_TIMING.moon.startBrightness,
    endBrightness: SECTION2_TIMING.moon.endBrightness,
  },
  section3: {
    endScale: SECTION3_TIMING.moon.endScale,
    endLeftVw: SECTION3_TIMING.moon.endLeftVw,
    endTopVh: SECTION3_TIMING.moon.endTopVh,
    endRotation: SECTION3_TIMING.moon.endRotation,
    triggerEnd: "top 20%",
  },
};

// Smoothing factor for moon movement (lower = smoother but laggier)
const SMOOTH_FACTOR = 0.12;

export default function MoonReveal() {
  const maskRef = useRef<HTMLDivElement>(null);
  const moonRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const moonGlowRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Refs for smooth animation
  const section3ProgressRef = useRef(0);
  const section4ProgressRef = useRef(0);
  const targetMoonState = useRef({
    left: 0,
    top: 0,
    size: 0,
    rotation: 0,
    opacity: 1,
  });
  const currentMoonState = useRef({
    left: 0,
    top: 0,
    size: 0,
    rotation: 0,
    opacity: 1,
  });
  const animationFrameRef = useRef<number | null>(null);
  const isSection3Active = useRef(false);

  // Subscribe to global scroll progress for section 4
  const scrollProgress = useScrollProgress();

  // Update section4 progress ref for animation loop
  useEffect(() => {
    section4ProgressRef.current = scrollProgress.section4;
  }, [scrollProgress.section4]);

  useEffect(() => {
    const mask = maskRef.current;
    const moon = moonRef.current;
    const glow = glowRef.current;
    const moonGlow = moonGlowRef.current;
    const text = textRef.current;

    if (!mask || !moon || !glow || !moonGlow) return;

    // Helper functions
    const lerp = (start: number, end: number, p: number) => start + (end - start) * p;
    const mapRange = (p: number, min: number, max: number) =>
      Math.max(0, Math.min(1, (p - min) / (max - min)));

    // Calculate base moon size
    const getBaseSize = () => Math.max(window.innerWidth * 1.5, window.innerHeight * 1.5);

    // Get section 2 end position (where section 3 should start)
    const getSection2EndPosition = () => {
      const baseSize = getBaseSize();
      const centerX = window.innerWidth / 2;
      const bottomPos = window.innerHeight;
      const centerY = bottomPos + baseSize * (CONFIG.section2.endYPercent / 100 - 0.5);
      return { centerX, centerY, size: baseSize };
    };

    // Initialize current state
    const initState = getSection2EndPosition();
    currentMoonState.current = {
      left: initState.centerX,
      top: initState.centerY,
      size: initState.size,
      rotation: 0,
      opacity: 1,
    };
    targetMoonState.current = { ...currentMoonState.current };

    // Smooth animation loop for section 3
    const animateSmooth = () => {
      if (!isSection3Active.current) {
        animationFrameRef.current = requestAnimationFrame(animateSmooth);
        return;
      }

      const current = currentMoonState.current;
      const target = targetMoonState.current;

      // Lerp towards target
      current.left += (target.left - current.left) * SMOOTH_FACTOR;
      current.top += (target.top - current.top) * SMOOTH_FACTOR;
      current.size += (target.size - current.size) * SMOOTH_FACTOR;
      current.rotation += (target.rotation - current.rotation) * SMOOTH_FACTOR;
      current.opacity += (target.opacity - current.opacity) * SMOOTH_FACTOR;

      // Calculate fade-out based on section 4 progress
      const s4p = section4ProgressRef.current;
      const fadeOut = calculateFadeOut(s4p, SECTION3_TIMING.fadeOut.start, SECTION3_TIMING.fadeOut.end);
      target.opacity = fadeOut;

      // Apply fade: move moon further off-screen and scale down
      const fadeOffsetX = (1 - current.opacity) * -200; // Move left
      const fadeOffsetY = (1 - current.opacity) * -150; // Move up
      const fadeScale = 0.5 + current.opacity * 0.5; // Scale from 50% to 100%

      // Apply to DOM
      const displaySize = current.size * fadeScale;
      moon.style.width = `${displaySize}px`;
      moon.style.height = `${displaySize}px`;
      moon.style.left = `${current.left + fadeOffsetX}px`;
      moon.style.top = `${current.top + fadeOffsetY}px`;
      moon.style.bottom = "auto";
      moon.style.transform = `translate(-50%, -50%) rotate(${current.rotation}deg)`;
      moon.style.opacity = String(current.opacity);

      // Section 3 moon glow - follows moon position with larger size
      const glowSize = displaySize * 1.8;
      moonGlow.style.width = `${glowSize}px`;
      moonGlow.style.height = `${glowSize}px`;
      moonGlow.style.left = `${current.left + fadeOffsetX}px`;
      moonGlow.style.top = `${current.top + fadeOffsetY}px`;
      moonGlow.style.opacity = String(current.opacity);

      // Hide mask when fully faded
      if (current.opacity < 0.01) {
        mask.style.opacity = "0";
      } else {
        mask.style.opacity = "1";
      }

      animationFrameRef.current = requestAnimationFrame(animateSmooth);
    };

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(animateSmooth);

    // Section 2 ScrollTrigger - moon reveal
    const trigger1 = ScrollTrigger.create({
      trigger: "#moon-section",
      start: "top bottom",
      end: "top top",
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        const s3p = section3ProgressRef.current;

        // Mask: 0% -> 120%
        mask.style.setProperty("--mask-progress", `${lerp(0, 120, p)}%`);

        // Only apply section 2 transforms if section 3 hasn't started
        if (s3p <= 0) {
          isSection3Active.current = false;
          const yPercent = lerp(CONFIG.section2.startYPercent, CONFIG.section2.endYPercent, p);
          const brightness = lerp(CONFIG.section2.startBrightness, CONFIG.section2.endBrightness, p);

          moon.style.width = "max(150vw, 150vh)";
          moon.style.height = "max(150vw, 150vh)";
          moon.style.left = "50%";
          moon.style.bottom = "0";
          moon.style.top = "auto";
          moon.style.transform = `translateX(-50%) translateY(${yPercent}%) rotate(0deg)`;
          moon.style.filter = `brightness(${brightness})`;
          moon.style.opacity = "1"; // Reset opacity when in section 2
          mask.style.opacity = "1";

          // Update current state for smooth transition
          const baseSize = getBaseSize();
          currentMoonState.current = {
            left: window.innerWidth / 2,
            top: window.innerHeight + baseSize * (yPercent / 100 - 0.5),
            size: baseSize,
            rotation: 0,
            opacity: 1,
          };
          targetMoonState.current = { ...currentMoonState.current };
        }

        // Glow effect - position based on scroll, opacity handled by CSS transition
        const easedP = 1 - Math.pow(1 - p, 2);
        const glowY = lerp(100, 30, easedP);
        glow.style.setProperty("--glow-y", `${glowY}%`);
        // Set base opacity (will be overridden by section 3 fade)
        if (s3p <= 0) {
          glow.style.opacity = String(easedP);
        }

        // Text: fade out when section 3 progress reaches 0.5
        if (text) {
          const textP = mapRange(p, 0.5, 0.8);
          const easedTextP = 1 - Math.pow(1 - textP, 2);
          const textY = lerp(30, 0, easedTextP);
          // Fade out when section 3 progress passes 0.5
          const section3FadeOut = Math.max(0, 1 - mapRange(s3p, 0.5, 0.5));
          const textOpacity = easedTextP * section3FadeOut;
          text.style.opacity = String(Math.max(0, textOpacity));
          text.style.transform = `translateY(${textY}px)`;
        }
      },
    });

    // Section 3 ScrollTrigger - moon moves to top-left with rotation
    // Starts exactly where section 2 ends for seamless blend
    const trigger2 = ScrollTrigger.create({
      trigger: "#moon-section",
      start: "top top",
      end: "bottom top-=20%",
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        section3ProgressRef.current = p;

        if (p <= 0) {
          isSection3Active.current = false;
          // Show section 2 glow, hide moon glow
          if (glow) glow.classList.remove("opacity-0");
          if (moonGlow) moonGlow.classList.add("opacity-0");

          // Reset moon opacity and state when returning to section 2
          moon.style.opacity = "1";
          moonGlow.style.opacity = "0";
          mask.style.opacity = "1";

          // Reset target and current opacity to fully visible
          targetMoonState.current.opacity = 1;
          currentMoonState.current.opacity = 1;
          return;
        }

        isSection3Active.current = true;

        // Fade out section 2 glow, fade in moon glow (CSS transition handles smoothness)
        if (glow) glow.classList.add("opacity-0");
        if (moonGlow) moonGlow.classList.remove("opacity-0");

        // Fade out text when section 3 progress reaches 0.5
        if (text) {
          const textFadeOut = Math.max(0, 1 - mapRange(p, 0.2, 0.5));
          text.style.opacity = String(textFadeOut);
        }

        // Eased progress for smooth motion
        const easedP = 1 - Math.pow(1 - p, 3);

        // Get starting position from section 2 end state
        const startPos = getSection2EndPosition();

        // Calculate target scale and size
        const scale = lerp(1, CONFIG.section3.endScale, easedP);
        const targetSize = startPos.size * scale;

        // Calculate end position (in pixels)
        const endLeft = (CONFIG.section3.endLeftVw / 100) * window.innerWidth;
        const endTop = (CONFIG.section3.endTopVh / 100) * window.innerHeight;

        // Set target position for smooth interpolation
        // Note: opacity is controlled by section 4 progress in the animation loop
        targetMoonState.current = {
          left: lerp(startPos.centerX, endLeft, easedP),
          top: lerp(startPos.centerY, endTop, easedP),
          size: targetSize,
          rotation: lerp(0, CONFIG.section3.endRotation, easedP),
          opacity: targetMoonState.current.opacity,
        };

        moon.style.filter = `brightness(${CONFIG.section2.endBrightness})`;
      },
    });

    // Handle resize
    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      trigger1.kill();
      trigger2.kill();
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Section 2 Glow effect */}
      <div
        ref={glowRef}
        className="fixed inset-x-0 bottom-[-10vh]! z-[19] pointer-events-none transition-opacity duration-200"
        style={
          {
            "--glow-y": "100%",
            height: "110vh",
            opacity: 0,
            background:
              "radial-gradient(ellipse 200% 80% at 50% var(--glow-y), rgba(245,245,245,0.3) 0%, rgba(230,230,230,0.2) 10%, rgba(210,210,210,0.12) 25%, rgba(190,190,190,0.06) 40%, rgba(170,170,170,0.02) 55%, transparent 75%)",
          } as React.CSSProperties
        }
        aria-hidden="true"
      />

      {/* Section 3 moon glow - positioned behind the moon */}
      <div
        ref={moonGlowRef}
        className="fixed z-[19] pointer-events-none opacity-0 transition-opacity duration-300"
        style={{
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(245,245,245,0.25) 0%, rgba(220,220,220,0.15) 20%, rgba(200,200,200,0.08) 40%, rgba(180,180,180,0.03) 60%, transparent 70%)",
        }}
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
        {/* Moon image */}
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

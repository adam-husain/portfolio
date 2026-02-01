"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useScrollProgress } from "@/app/lib/scrollProgress";

// TODO: Future improvements
// - Add reduced motion support (prefers-reduced-motion media query)
// - Consider using CSS transforms with GPU acceleration hints
// - Add loading="eager" for above-fold clouds if needed
// - Consider IntersectionObserver to pause animations when not visible
// - Optimize mobile animations with CSS-only approach if performance issues arise

interface ParallaxState {
  x: number;
  y: number;
}

interface CloudLayer {
  src: string;
  position: { left?: string; right?: string; top?: string; bottom?: string };
  size: string;
  mobileSize: string;
  mobilePosition?: { left?: string; right?: string; top?: string; bottom?: string };
  opacity: number;
  blur: number;
  parallaxMultiplier: number;
  zIndex: number;
  layer: "front" | "back";
  scaleX?: number;
  scaleY?: number;
  rotate?: number;
  flip?: boolean;
  fadeIn: number;
  slideDistance: number;
  exitSide: "left" | "right";
  section5DriftRate: number;
}

// Cloud layers: back (z-29, behind balloon), front (z-35, above balloon), overlay (z-36)
const CLOUD_LAYERS: CloudLayer[] = [
  // Back layers
  {
    src: "/images/clouds/bunched.webp",
    position: { left: "-50%", bottom: "-5%" },
    mobilePosition: { left: "-40%", bottom: "-3%" },
    size: "100vw",
    mobileSize: "250vw",
    opacity: 0.6,
    blur: 4,
    parallaxMultiplier: 0.008,
    zIndex: 29,
    layer: "back",
    scaleX: 1.3,
    scaleY: 0.8,
    fadeIn: 0.5,
    slideDistance: 140,
    exitSide: "left",
    section5DriftRate: 0.6,
  },
  {
    src: "/images/clouds/horizontal-2.webp",
    position: { right: "-18%", top: "20%" },
    mobilePosition: { right: "-40%", top: "25%" },
    size: "65vw",
    mobileSize: "130vw",
    opacity: 0.45,
    blur: 4,
    parallaxMultiplier: 0.01,
    zIndex: 29,
    layer: "back",
    scaleX: 1.5,
    scaleY: 0.85,
    flip: true,
    fadeIn: 0.52,
    slideDistance: 135,
    exitSide: "right",
    section5DriftRate: 0.45,
  },
  {
    src: "/images/clouds/vertical.webp",
    position: { left: "5%", top: "30%" },
    mobilePosition: { left: "-20%", top: "35%" },
    size: "40vw",
    mobileSize: "90vw",
    opacity: 0.4,
    blur: 3,
    parallaxMultiplier: 0.007,
    zIndex: 29,
    layer: "back",
    scaleX: 1.2,
    rotate: -8,
    fadeIn: 0.55,
    slideDistance: 125,
    exitSide: "left",
    section5DriftRate: 1,
  },
  // Front layers
  {
    src: "/images/clouds/bunched.webp",
    position: { left: "-8%", top: "3%" },
    mobilePosition: { left: "-30%", top: "5%" },
    size: "50vw",
    mobileSize: "110vw",
    opacity: 0.75,
    blur: 1,
    parallaxMultiplier: 0.02,
    zIndex: 35,
    layer: "front",
    scaleX: 1.3,
    scaleY: 0.95,
    rotate: 5,
    fadeIn: 0.55,
    slideDistance: 115,
    exitSide: "left",
    section5DriftRate: 0.7,
  },
  {
    src: "/images/clouds/horizontal.webp",
    position: { left: "0%", bottom: "-8%" },
    mobilePosition: { left: "-25%", bottom: "-5%" },
    size: "110vw",
    mobileSize: "200vw",
    opacity: 0.85,
    blur: 1,
    parallaxMultiplier: 0.018,
    zIndex: 35,
    layer: "front",
    scaleX: 1.4,
    scaleY: 0.75,
    fadeIn: 0.58,
    slideDistance: 120,
    exitSide: "left",
    section5DriftRate: 0.35,
  },
  {
    src: "/images/clouds/horizontal-2.webp",
    position: { right: "-10%", top: "15%" },
    mobilePosition: { right: "-30%", top: "20%" },
    size: "55vw",
    mobileSize: "120vw",
    opacity: 0.7,
    blur: 1,
    parallaxMultiplier: 0.022,
    zIndex: 35,
    layer: "front",
    scaleX: 1.35,
    scaleY: 0.9,
    fadeIn: 0.6,
    slideDistance: 110,
    exitSide: "right",
    section5DriftRate: 0.9,
  },
  {
    src: "/images/clouds/vertical.webp",
    position: { left: "10%", top: "40%" },
    mobilePosition: { left: "-15%", top: "45%" },
    size: "35vw",
    mobileSize: "85vw",
    opacity: 0.65,
    blur: 1,
    parallaxMultiplier: 0.025,
    zIndex: 35,
    layer: "front",
    scaleX: 1.2,
    rotate: 10,
    fadeIn: 0.62,
    slideDistance: 105,
    exitSide: "left",
    section5DriftRate: 0.55,
  },
  {
    src: "/images/clouds/bunched.webp",
    position: { right: "3%", bottom: "8%" },
    mobilePosition: { right: "-10%", bottom: "12%" },
    size: "30vw",
    mobileSize: "80vw",
    opacity: 0.6,
    blur: 1,
    parallaxMultiplier: 0.028,
    zIndex: 35,
    layer: "front",
    scaleX: 1.25,
    flip: true,
    fadeIn: 0.65,
    slideDistance: 100,
    exitSide: "right",
    section5DriftRate: 0.75,
  },
  // Overlay layers (subtle atmospheric haze)
  {
    src: "/images/clouds/bunched.webp",
    position: { right: "15%", top: "20%" },
    mobilePosition: { right: "-10%", top: "25%" },
    size: "45vw",
    mobileSize: "100vw",
    opacity: 0.12,
    blur: 3,
    parallaxMultiplier: 0.035,
    zIndex: 36,
    layer: "front",
    scaleX: 1.3,
    scaleY: 0.85,
    rotate: -5,
    fadeIn: 0.63,
    slideDistance: 95,
    exitSide: "right",
    section5DriftRate: 0.8,
  },
  {
    src: "/images/clouds/vertical.webp",
    position: { left: "20%", top: "25%" },
    mobilePosition: { left: "15%", top: "30%" },
    size: "35vw",
    mobileSize: "80vw",
    opacity: 0.1,
    blur: 2,
    parallaxMultiplier: 0.032,
    zIndex: 36,
    layer: "front",
    scaleX: 1.1,
    scaleY: 1.2,
    rotate: 8,
    fadeIn: 0.58,
    slideDistance: 85,
    exitSide: "left",
    section5DriftRate: 0.65,
  },
];

// Animation constants
const MOUSE_EASE = 0.04;
const MOUSE_MULTIPLIER = 15;
const SLIDE_DURATION = 0.2;
const SECTION5_DRIFT_MAX = 80;
const EXIT_START = 0.1;
const EXIT_END = 0.55;
const EXIT_DRIFT_DISTANCE = 120;
const DRIFT_SMOOTHING = 0.06;
const EXIT_SMOOTHING = 0.05;
const CLOUD_COUNT = CLOUD_LAYERS.length;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function CloudAtmosphere() {
  const [mounted, setMounted] = useState(false);
  const parallaxRef = useRef<ParallaxState>({ x: 0, y: 0 });
  const smoothParallaxRef = useRef<ParallaxState>({ x: 0, y: 0 });
  const cloudRefs = useRef<(HTMLDivElement | null)[]>([]);
  const opacityRefs = useRef<number[]>(new Array(CLOUD_COUNT).fill(0));
  const smoothDriftYRefs = useRef<number[]>(new Array(CLOUD_COUNT).fill(0));
  const smoothExitXRefs = useRef<number[]>(new Array(CLOUD_COUNT).fill(0));
  const scrollProgress = useScrollProgress();

  const section4Progress = scrollProgress.section4;
  const section5Progress = scrollProgress.section5;
  const section6Progress = scrollProgress.section6;
  const section4ProgressRef = useRef(section4Progress);
  const section5ProgressRef = useRef(section5Progress);
  const section6ProgressRef = useRef(section6Progress);

  useEffect(() => { section4ProgressRef.current = section4Progress; }, [section4Progress]);
  useEffect(() => { section5ProgressRef.current = section5Progress; }, [section5Progress]);
  useEffect(() => { section6ProgressRef.current = section6Progress; }, [section6Progress]);

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (typeof window === "undefined") return;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    parallaxRef.current = {
      x: ((clientX - centerX) / centerX) * MOUSE_MULTIPLIER,
      y: ((clientY - centerY) / centerY) * MOUSE_MULTIPLIER * 0.4,
    };
  }, []);

  useEffect(() => {
    // Use requestAnimationFrame to defer state update and avoid synchronous setState warning
    const frameId = requestAnimationFrame(() => setMounted(true));
    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [handlePointerMove]);

  useEffect(() => {
    if (!mounted) return;

    let animationId: number;

    const animate = () => {
      const target = parallaxRef.current;
      const smooth = smoothParallaxRef.current;
      const progress = section4ProgressRef.current;
      const section5Prog = section5ProgressRef.current;
      const exitProgress = section6ProgressRef.current;

      smooth.x += (target.x - smooth.x) * MOUSE_EASE;
      smooth.y += (target.y - smooth.y) * MOUSE_EASE;

      const refs = cloudRefs.current;
      for (let i = 0; i < CLOUD_COUNT; i++) {
        const el = refs[i];
        if (!el) continue;
        const cloud = CLOUD_LAYERS[i];

        // Fade in and slide up
        let targetOpacity = 0;
        let slideProgress = 0;
        if (progress >= cloud.fadeIn) {
          const animationProgress = (progress - cloud.fadeIn) / SLIDE_DURATION;
          targetOpacity = cloud.opacity * Math.min(1, animationProgress * 1.2);
          slideProgress = easeOutCubic(Math.min(1, animationProgress));
        }

        // Section 5 vertical drift
        let targetDriftY = 0;
        if (section5Prog > 0) {
          targetDriftY = -section5Prog * SECTION5_DRIFT_MAX * cloud.section5DriftRate;
        }
        const smoothedDriftY = smoothDriftYRefs.current[i] + (targetDriftY - smoothDriftYRefs.current[i]) * DRIFT_SMOOTHING;
        smoothDriftYRefs.current[i] = smoothedDriftY;

        // Exit animation (section 6)
        let targetExitX = 0;
        let exitOpacityMultiplier = 1;
        if (exitProgress > EXIT_START) {
          const exitAnimProgress = Math.min(1, (exitProgress - EXIT_START) / (EXIT_END - EXIT_START));
          const easedExit = easeInOutCubic(exitAnimProgress);
          targetExitX = easedExit * EXIT_DRIFT_DISTANCE * (cloud.exitSide === "left" ? -1 : 1);
          exitOpacityMultiplier = 1 - easedExit;
        }
        const smoothedExitX = smoothExitXRefs.current[i] + (targetExitX - smoothExitXRefs.current[i]) * EXIT_SMOOTHING;
        smoothExitXRefs.current[i] = smoothedExitX;

        targetOpacity *= exitOpacityMultiplier;
        const newOpacity = opacityRefs.current[i] + (targetOpacity - opacityRefs.current[i]) * 0.08;
        opacityRefs.current[i] = newOpacity;

        const slideOffset = (1 - slideProgress) * cloud.slideDistance;
        const translateX = (smooth.x * cloud.parallaxMultiplier) + (smoothedExitX * window.innerWidth / 100);
        const translateY = (smooth.y * cloud.parallaxMultiplier) + (slideOffset * window.innerHeight / 100) + smoothedDriftY;
        const scaleX = (cloud.scaleX ?? 1) * (cloud.flip ? -1 : 1);
        const scaleY = cloud.scaleY ?? 1;
        const rotate = cloud.rotate ?? 0;

        el.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY}) rotate(${rotate}deg)`;
        el.style.opacity = String(newOpacity);
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [mounted]);

  if (!mounted || section4Progress < 0.45) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {CLOUD_LAYERS.map((cloud, index) => {
        const position = cloud.position;
        const mobilePosition = cloud.mobilePosition || cloud.position;
        const scaleX = (cloud.scaleX ?? 1) * (cloud.flip ? -1 : 1);
        const scaleY = cloud.scaleY ?? 1;
        const rotate = cloud.rotate ?? 0;
        const initialTransform = `scale(${scaleX}, ${scaleY}) rotate(${rotate}deg)`;

        // Mobile animation calculations
        const animationProgress = section4Progress >= cloud.fadeIn
          ? (section4Progress - cloud.fadeIn) / SLIDE_DURATION
          : 0;
        let mobileOpacity = section4Progress >= cloud.fadeIn
          ? cloud.opacity * Math.min(1, animationProgress * 1.2)
          : 0;
        const mobileSlideProgress = easeOutCubic(Math.min(1, animationProgress));
        const mobileSlideOffset = (1 - mobileSlideProgress) * cloud.slideDistance;
        const mobileSection5DriftY = section5Progress > 0
          ? -section5Progress * SECTION5_DRIFT_MAX * cloud.section5DriftRate
          : 0;
        let mobileExitDriftX = 0;
        if (section6Progress > EXIT_START) {
          const exitAnimProgress = Math.min(1, (section6Progress - EXIT_START) / (EXIT_END - EXIT_START));
          const easedExit = easeInOutCubic(exitAnimProgress);
          mobileExitDriftX = easedExit * EXIT_DRIFT_DISTANCE * (cloud.exitSide === "left" ? -1 : 1);
          mobileOpacity *= (1 - easedExit);
        }
        const totalYOffset = `calc(${mobileSlideOffset}vh + ${mobileSection5DriftY}px)`;

        return (
          <div key={index}>
            {/* Desktop cloud with JS animation */}
            <div
              ref={(el) => { cloudRefs.current[index] = el; }}
              className="hidden md:block absolute will-change-transform aspect-[3/2]"
              style={{
                ...position,
                width: cloud.size,
                zIndex: cloud.zIndex,
                opacity: 0,
                filter: `blur(${cloud.blur}px)`,
                transform: initialTransform,
              }}
            >
              <Image src={cloud.src} alt="" fill className="object-contain select-none" draggable={false} loading="lazy" />
            </div>
            {/* Mobile cloud with CSS transitions */}
            <div
              className="md:hidden absolute aspect-[3/2]"
              style={{
                ...mobilePosition,
                width: cloud.mobileSize,
                zIndex: cloud.zIndex,
                opacity: mobileOpacity,
                filter: `blur(${cloud.blur}px)`,
                transform: `translate(${mobileExitDriftX}vw, ${totalYOffset}) scale(${scaleX}, ${scaleY}) rotate(${rotate}deg)`,
                transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
              }}
            >
              <Image src={cloud.src} alt="" fill className="object-contain select-none" draggable={false} loading="lazy" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

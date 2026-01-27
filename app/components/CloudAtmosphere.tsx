"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useScrollProgress } from "@/app/lib/scrollProgress";

interface ParallaxState {
  x: number;
  y: number;
}

interface CloudLayer {
  src: string;
  position: {
    left?: string;
    right?: string;
    top?: string;
    bottom?: string;
  };
  size: string;
  mobileSize: string;
  mobilePosition?: {
    left?: string;
    right?: string;
    top?: string;
    bottom?: string;
  };
  opacity: number;
  blur: number;
  parallaxMultiplier: number;
  zIndex: number;
  layer: "front" | "back";
  scaleX?: number; // Horizontal stretch
  scaleY?: number; // Vertical stretch
  rotate?: number;
  flip?: boolean;
  fadeIn: number;
  // Slide-up animation: clouds rise gracefully as they fade in
  // Higher values = clouds start further below and rise more
  slideDistance: number; // in vh units
  // Exit animation: clouds split horizontally and drift off-screen
  // "left" = drift leftward, "right" = drift rightward
  // Determined by horizontal position (left-side clouds go left, right-side go right)
  exitSide: "left" | "right";
  // Section 5 vertical drift multiplier (0-1): how much this cloud drifts up
  // Creates varied "parting curtains" effect with clouds rising at different paces
  section5DriftRate: number;
}

// ============================================================
// CLOUD CONFIGURATION
// ============================================================
// Volumetric clouds positioned around the balloon
// Front layers: z-index 35 (above balloon at 31)
// Back layers: z-index 29 (behind balloon)
//
// BALLOON PERSISTENCE NOTE:
// These clouds accompany the balloon from Section 4 (Re-entry)
// through Section 5 (Cloudscape). The balloon scales down in
// Section 5 while clouds become more prominent, creating the
// transition from atmospheric re-entry to calm cloudscape.
// ============================================================

const CLOUD_LAYERS: CloudLayer[] = [
  // ============================================================
  // BACK LAYERS (behind balloon, more blur, slower parallax)
  // These create depth and atmosphere behind the balloon
  // Back layers start further off-screen (120-150vh) for dramatic entry
  // ============================================================

  // Large horizontal cloud - bottom back (stretched wide)
  {
    src: "/images/clouds/horizontal.webp",
    position: { left: "-15%", bottom: "-5%" },
    mobilePosition: { left: "-20%", bottom: "-3%" },
    size: "130vw",
    mobileSize: "180vw",
    opacity: 0.6,
    blur: 4,
    parallaxMultiplier: 0.008,
    zIndex: 29,
    layer: "back",
    scaleX: 1.3,
    scaleY: 0.8,
    fadeIn: 0.5,
    slideDistance: 140, // Starts completely off-screen below
    exitSide: "left",
    section5DriftRate: 0.6,
  },

  // Bunched cloud - top left back (stretched horizontally)
  {
    src: "/images/clouds/bunched.webp",
    position: { left: "-12%", top: "8%" },
    mobilePosition: { left: "-18%", top: "12%" },
    size: "55vw",
    mobileSize: "70vw",
    opacity: 0.5,
    blur: 5,
    parallaxMultiplier: 0.006,
    zIndex: 29,
    layer: "back",
    scaleX: 1.4,
    scaleY: 0.9,
    fadeIn: 0.48,
    slideDistance: 130,
    exitSide: "left",
    section5DriftRate: 0.85,
  },

  // Horizontal-2 cloud - right side back (stretched)
  {
    src: "/images/clouds/horizontal-2.webp",
    position: { right: "-18%", top: "20%" },
    mobilePosition: { right: "-25%", top: "25%" },
    size: "65vw",
    mobileSize: "85vw",
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

  // Vertical cloud - left mid back
  {
    src: "/images/clouds/vertical.webp",
    position: { left: "5%", top: "30%" },
    mobilePosition: { left: "0%", top: "35%" },
    size: "40vw",
    mobileSize: "55vw",
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
    section5DriftRate: 1.0,
  },

  // ============================================================
  // FRONT LAYERS (in front of balloon, less blur, more parallax)
  // These frame the balloon and add foreground atmosphere
  // Front layers start off-screen but closer (100-120vh)
  // ============================================================

  // Bunched cloud - top left front (stretched)
  {
    src: "/images/clouds/bunched.webp",
    position: { left: "-8%", top: "3%" },
    mobilePosition: { left: "-12%", top: "5%" },
    size: "50vw",
    mobileSize: "65vw",
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

  // Horizontal cloud - bottom front (stretched wide for floor effect)
  {
    src: "/images/clouds/horizontal.webp",
    position: { left: "0%", bottom: "-8%" },
    mobilePosition: { left: "-5%", bottom: "-5%" },
    size: "110vw",
    mobileSize: "140vw",
    opacity: 0.85,
    blur: 1,
    parallaxMultiplier: 0.018,
    zIndex: 35,
    layer: "front",
    scaleX: 1.4,
    scaleY: 0.75,
    fadeIn: 0.58,
    slideDistance: 120, // Floor cloud rises dramatically from below
    exitSide: "left", // Wide cloud, drifts left
    section5DriftRate: 0.35,
  },

  // Horizontal-2 cloud - right front (stretched)
  {
    src: "/images/clouds/horizontal-2.webp",
    position: { right: "-10%", top: "15%" },
    mobilePosition: { right: "-15%", top: "20%" },
    size: "55vw",
    mobileSize: "75vw",
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

  // Vertical cloud - left front accent
  {
    src: "/images/clouds/vertical.webp",
    position: { left: "10%", top: "40%" },
    mobilePosition: { left: "5%", top: "45%" },
    size: "35vw",
    mobileSize: "50vw",
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

  // Small bunched accent - bottom right front
  {
    src: "/images/clouds/bunched.webp",
    position: { right: "3%", bottom: "8%" },
    mobilePosition: { right: "-2%", bottom: "12%" },
    size: "30vw",
    mobileSize: "45vw",
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

  // ============================================================
  // OVERLAY LAYERS (on top of balloon, minimal opacity)
  // These create atmospheric depth by partially obscuring the balloon
  // z-index 36+ to render above balloon (which is at z-index 31)
  // ============================================================

  // Wispy horizontal overlay - center screen
  {
    src: "/images/clouds/horizontal.webp",
    position: { left: "10%", top: "35%" },
    mobilePosition: { left: "5%", top: "40%" },
    size: "80vw",
    mobileSize: "100vw",
    opacity: 0.15, // Very subtle, ghostly overlay
    blur: 2,
    parallaxMultiplier: 0.03,
    zIndex: 36,
    layer: "front",
    scaleX: 1.5,
    scaleY: 0.6,
    fadeIn: 0.6,
    slideDistance: 90,
    exitSide: "left",
    section5DriftRate: 0.5,
  },

  // Soft bunched overlay - upper area
  {
    src: "/images/clouds/bunched.webp",
    position: { right: "15%", top: "20%" },
    mobilePosition: { right: "10%", top: "25%" },
    size: "45vw",
    mobileSize: "60vw",
    opacity: 0.12, // Barely visible, adds atmospheric haze
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

  // Delicate vertical wisp - left side overlay
  {
    src: "/images/clouds/vertical.webp",
    position: { left: "20%", top: "25%" },
    mobilePosition: { left: "15%", top: "30%" },
    size: "35vw",
    mobileSize: "45vw",
    opacity: 0.1, // Extremely subtle
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

// Easing config for cursor following
const MOUSE_EASE = 0.04;
const MOUSE_MULTIPLIER = 15;

// Slide animation duration (in scroll progress units)
// Clouds take 20% of scroll progress to complete their slide-up
const SLIDE_DURATION = 0.2;

// ============================================================
// SECTION 5 VERTICAL DRIFT (Cloudscape - Parting Curtains)
// ============================================================
// As user scrolls through section 5, clouds drift vertically
// Left-side clouds drift up, right-side clouds drift down (or vice versa)
// Creates a subtle "parting" effect before the full horizontal split
const SECTION5_DRIFT_MAX = 80; // Maximum vertical drift in pixels

// ============================================================
// EXIT ANIMATION CONFIG (Section 6 - Cityscape)
// ============================================================
// Clouds split horizontally - left clouds drift left, right clouds drift right
// Creates a "parting curtain" effect revealing the cityscape beneath
const EXIT_START = 0.1; // When exit animation begins (section 6 progress)
const EXIT_END = 0.55; // When exit animation completes
const EXIT_DRIFT_DISTANCE = 120; // vw units - how far clouds drift horizontally

// Cubic ease-out for graceful deceleration
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Ease-in-out for smooth exit animation
function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Smoothing factor for cloud animations (lower = smoother but slower)
const DRIFT_SMOOTHING = 0.06;
const EXIT_SMOOTHING = 0.05;

export default function CloudAtmosphere() {
  const [mounted, setMounted] = useState(false);
  const parallaxRef = useRef<ParallaxState>({ x: 0, y: 0 });
  const smoothParallaxRef = useRef<ParallaxState>({ x: 0, y: 0 });
  const cloudRefs = useRef<(HTMLDivElement | null)[]>([]);
  const opacityRefs = useRef<number[]>(CLOUD_LAYERS.map(() => 0));
  // Smoothed animation values for each cloud
  const smoothDriftYRefs = useRef<number[]>(CLOUD_LAYERS.map(() => 0));
  const smoothExitXRefs = useRef<number[]>(CLOUD_LAYERS.map(() => 0));
  const scrollProgress = useScrollProgress();
  const section4Progress = scrollProgress.section4;
  const section5Progress = scrollProgress.section5;
  const section6Progress = scrollProgress.section6;
  const section4ProgressRef = useRef(section4Progress);
  const section5ProgressRef = useRef(section5Progress);
  const section6ProgressRef = useRef(section6Progress);

  // Keep refs in sync
  useEffect(() => {
    section4ProgressRef.current = section4Progress;
  }, [section4Progress]);

  useEffect(() => {
    section5ProgressRef.current = section5Progress;
  }, [section5Progress]);

  useEffect(() => {
    section6ProgressRef.current = section6Progress;
  }, [section6Progress]);

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (typeof window === "undefined") return;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Normalize to -1 to 1
    const x = (clientX - centerX) / centerX;
    const y = (clientY - centerY) / centerY;

    parallaxRef.current = { x: x * MOUSE_MULTIPLIER, y: y * MOUSE_MULTIPLIER * 0.4 };
  }, []);

  useEffect(() => {
    setMounted(true);

    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [handlePointerMove]);

  // Animation loop for parallax and opacity
  useEffect(() => {
    if (!mounted) return;

    let animationId: number;

    const animate = () => {
      const target = parallaxRef.current;
      const smooth = smoothParallaxRef.current;
      const progress = section4ProgressRef.current;
      const section5Prog = section5ProgressRef.current;
      const exitProgress = section6ProgressRef.current;

      // Lerp smooth values toward target (cursor easing)
      smooth.x += (target.x - smooth.x) * MOUSE_EASE;
      smooth.y += (target.y - smooth.y) * MOUSE_EASE;

      // Update each cloud
      cloudRefs.current.forEach((el, i) => {
        if (!el) return;

        const cloud = CLOUD_LAYERS[i];
        if (!cloud) return;

        // Calculate opacity and slide progress - clouds fade IN and slide UP
        // They persist through section 5 (Cloudscape)
        let targetOpacity = 0;
        let slideProgress = 0; // 0 = fully below, 1 = at final position

        if (progress >= cloud.fadeIn) {
          // Calculate how far through the animation we are
          const animationProgress = (progress - cloud.fadeIn) / SLIDE_DURATION;

          // Opacity fades in slightly faster than slide for a layered feel
          const fadeInProgress = Math.min(1, animationProgress * 1.2);
          targetOpacity = cloud.opacity * fadeInProgress;

          // Slide uses cubic ease-out for graceful deceleration
          slideProgress = easeOutCubic(Math.min(1, animationProgress));
        }

        // ============================================================
        // SECTION 5 VERTICAL DRIFT (Parting Curtains)
        // ============================================================
        // Scroll-driven vertical drift during section 5
        // All clouds drift UP at different paces based on section5DriftRate
        let targetDriftY = 0;
        if (section5Prog > 0) {
          // Negative = upward drift, rate varies per cloud for organic feel
          targetDriftY = -section5Prog * SECTION5_DRIFT_MAX * cloud.section5DriftRate;
        }

        // Smooth the vertical drift
        const currentDriftY = smoothDriftYRefs.current[i];
        const smoothedDriftY = currentDriftY + (targetDriftY - currentDriftY) * DRIFT_SMOOTHING;
        smoothDriftYRefs.current[i] = smoothedDriftY;

        // ============================================================
        // EXIT ANIMATION (Section 6 - Cityscape)
        // ============================================================
        // Clouds split horizontally and fade out as cityscape appears
        let targetExitX = 0;
        let exitOpacityMultiplier = 1;

        if (exitProgress > EXIT_START) {
          // Calculate exit animation progress (0 to 1)
          const exitAnimProgress = Math.min(1, (exitProgress - EXIT_START) / (EXIT_END - EXIT_START));
          const easedExit = easeInOutCubic(exitAnimProgress);

          // Horizontal drift: left clouds go left (negative), right clouds go right (positive)
          const driftDirection = cloud.exitSide === "left" ? -1 : 1;
          targetExitX = easedExit * EXIT_DRIFT_DISTANCE * driftDirection;

          // Opacity fades out smoothly
          exitOpacityMultiplier = 1 - easedExit;
        }

        // Smooth the horizontal exit drift
        const currentExitX = smoothExitXRefs.current[i];
        const smoothedExitX = currentExitX + (targetExitX - currentExitX) * EXIT_SMOOTHING;
        smoothExitXRefs.current[i] = smoothedExitX;

        // Apply exit opacity multiplier
        targetOpacity *= exitOpacityMultiplier;

        // Smooth opacity transitions
        const currentOpacity = opacityRefs.current[i];
        const newOpacity = currentOpacity + (targetOpacity - currentOpacity) * 0.08;
        opacityRefs.current[i] = newOpacity;

        // Calculate slide offset: starts at slideDistance vh below, rises to 0
        // (1 - slideProgress) means we start at full offset and move to zero
        const slideOffset = (1 - slideProgress) * cloud.slideDistance;

        // Build transform with parallax, scale, rotation, flip, slide, section5 drift, AND exit drift
        const translateX = (smooth.x * cloud.parallaxMultiplier) + (smoothedExitX * window.innerWidth / 100);
        // Cursor parallax Y + slide-up offset + section 5 parting drift (all smoothed)
        const translateY = (smooth.y * cloud.parallaxMultiplier) + (slideOffset * window.innerHeight / 100) + smoothedDriftY;
        const scaleX = cloud.scaleX ?? 1;
        const scaleY = cloud.scaleY ?? 1;
        const flipX = cloud.flip ? -1 : 1;
        const rotate = cloud.rotate ?? 0;

        el.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX * flipX}, ${scaleY}) rotate(${rotate}deg)`;
        el.style.opacity = String(newOpacity);
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [mounted]);

  if (!mounted) return null;

  // Don't render anything if not yet in section 4 range
  if (section4Progress < 0.45) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {CLOUD_LAYERS.map((cloud, index) => {
        const position = cloud.position;
        const mobilePosition = cloud.mobilePosition || cloud.position;
        const scaleX = cloud.scaleX ?? 1;
        const scaleY = cloud.scaleY ?? 1;
        const flipX = cloud.flip ? -1 : 1;
        const rotate = cloud.rotate ?? 0;
        const initialTransform = `scale(${scaleX * flipX}, ${scaleY}) rotate(${rotate}deg)`;

        return (
          <div key={index}>
            {/* Desktop version */}
            <div
              ref={(el) => {
                cloudRefs.current[index] = el;
              }}
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
              <Image
                src={cloud.src}
                alt=""
                fill
                className="object-contain select-none"
                draggable={false}
                loading="lazy"
              />
            </div>

            {/* Mobile version (simplified, no cursor parallax, but WITH slide-up, section5 drift, and exit) */}
            {(() => {
              // Calculate mobile animation values
              const animationProgress = section4Progress >= cloud.fadeIn
                ? (section4Progress - cloud.fadeIn) / SLIDE_DURATION
                : 0;
              let mobileOpacity = section4Progress >= cloud.fadeIn
                ? cloud.opacity * Math.min(1, animationProgress * 1.2)
                : 0;
              const mobileSlideProgress = easeOutCubic(Math.min(1, animationProgress));
              const mobileSlideOffset = (1 - mobileSlideProgress) * cloud.slideDistance;

              // Section 5 vertical drift (parting curtains)
              // All clouds drift UP at different paces
              let mobileSection5DriftY = 0;
              if (section5Progress > 0) {
                mobileSection5DriftY = -section5Progress * SECTION5_DRIFT_MAX * cloud.section5DriftRate;
              }

              // Exit animation for mobile
              let mobileExitDriftX = 0;
              if (section6Progress > EXIT_START) {
                const exitAnimProgress = Math.min(1, (section6Progress - EXIT_START) / (EXIT_END - EXIT_START));
                const easedExit = easeInOutCubic(exitAnimProgress);
                const driftDirection = cloud.exitSide === "left" ? -1 : 1;
                mobileExitDriftX = easedExit * EXIT_DRIFT_DISTANCE * driftDirection;
                mobileOpacity *= (1 - easedExit);
              }

              // Combine slide offset (vh) and section5 drift (px)
              const totalYOffset = `calc(${mobileSlideOffset}vh + ${mobileSection5DriftY}px)`;

              return (
                <div
                  className="md:hidden absolute aspect-[3/2]"
                  style={{
                    ...mobilePosition,
                    width: cloud.mobileSize,
                    zIndex: cloud.zIndex,
                    opacity: mobileOpacity,
                    filter: `blur(${cloud.blur}px)`,
                    transform: `translate(${mobileExitDriftX}vw, ${totalYOffset}) scale(${scaleX * flipX}, ${scaleY}) rotate(${rotate}deg)`,
                    transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
                  }}
                >
                  <Image
                    src={cloud.src}
                    alt=""
                    fill
                    className="object-contain select-none"
                    draggable={false}
                    loading="lazy"
                  />
                </div>
              );
            })()}
          </div>
        );
      })}
    </div>
  );
}

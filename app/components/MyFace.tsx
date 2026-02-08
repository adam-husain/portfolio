"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import posthog from "posthog-js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ============================================
// FACE LAYER SYSTEM
// ============================================
// Layer 1: BASE             - Face with blank/filled eye areas (bottom)
// Layer 2: EYEBALL          - Animated 3D eyeballs that track cursor
// Layer 3: OVERLAY          - Face with eye socket cutouts (masks eyeballs, shows only iris area)
// Layer 4a: GLINT_PERSISTENT - Always-visible subtle glasses reflection (follows overlay transforms)
// Layer 4b: GLINT_ANIMATED   - Diagonal sweep glint effect with feathered edges (cursor-triggered)
// ============================================

// Face layer images
const FACE_LAYERS = {
  BASE: "/images/mine/adam_face_base.png",
  OVERLAY: "/images/mine/adam_face_overlay.png",
  GLINT: "/images/mine/adam_glasses_glint.png",
} as const;

// ============================================
// EYE CONFIGURATION
// ============================================

// Eye positions (percentage from top-left of container)
const LEFT_EYE = { x: 37.5, y: 49.9 };
const RIGHT_EYE = { x: 61.5, y: 49.95 };

// Eyeball appearance
const EYEBALL_SIZE = 4.5; // percentage of container width
const EYEBALL_COLOR_OUTER = "#0a0a0a";
const EYEBALL_COLOR_INNER = "#2a2a2a";

// Eyeball highlight
const HIGHLIGHT_SIZE = 30; // percentage of eyeball size
const HIGHLIGHT_OFFSET = 25; // percentage offset from center
const HIGHLIGHT_OPACITY = 0.9;

// ============================================
// MOVEMENT & TRACKING (all values as % of container width for linear scaling)
// ============================================

// Eye tracking
const MOVEMENT_MAGNITUDE = 1.5; // % of container width - max eyeball movement from center
const CONVERGENCE_MIN_DISTANCE = 18; // % - full convergence (cross-eye) below this
const CONVERGENCE_MAX_DISTANCE = 91; // % - parallel gaze above this
const MIN_CONVERGENCE = 0.15; // minimum convergence factor (unitless ratio)
const SMOOTHING_FACTOR = 0.15; // eye movement smoothing (0.1-0.3 recommended)

// Close proximity (eyes look forward when cursor is near face)
const PROXIMITY_THRESHOLD_INNER = 9; // % of container width
const PROXIMITY_THRESHOLD_OUTER = 27; // % of container width

// Far distance (eyes stop tracking when cursor is too far)
const MAX_TRACKING_DISTANCE_INNER = 250; // % of container width - start fading at this distance
const MAX_TRACKING_DISTANCE_OUTER = 400; // % of container width - fully neutral beyond this

// 3D parallax for face layers
const LAYER_MOVEMENT = 0.36; // % of container width - max layer movement
const PARALLAX_SMOOTHING = 0.08;
const PERSPECTIVE_AMOUNT = 2; // max degrees of rotation

// Gyroscope (mobile)
const GYRO_SENSITIVITY = 2.7; // % of container width
const GYRO_CENTER_BETA = 45; // neutral front-to-back tilt (degrees)
const GYRO_CENTER_GAMMA = 0; // neutral left-right tilt (degrees)

// ============================================
// GLINT CONFIGURATION
// ============================================

// Persistent glint (always visible, subtle reflection)
const GLINT_PERSISTENT_OPACITY = 0.15;

// Animated glint (diagonal sweep effect)
const GLINT_ANIMATED_OPACITY = 0.15;
const GLINT_WIDTH = 15; // diagonal stripe width (percentage)
const GLINT_SKEW = 10; // diagonal angle offset
const GLINT_FEATHER = 8; // feather width on left/right edges (percentage)
const GLINT_RIGHT_DELAY = 0.15; // right lens lag behind left (0-1)
const GLINT_RANGE_START = 55; // screen width % where glint starts
const GLINT_RANGE_END = 65; // screen width % where glint ends

// ============================================
// EYEBALL COMPONENT
// ============================================

interface EyeballProps {
  position: { x: number; y: number };
  offset: { x: number; y: number };
  size: number;
}

function Eyeball({ position, offset, size }: EyeballProps) {
  const highlightOffsetX = -offset.x * 0.4;
  const highlightOffsetY = -offset.y * 0.4;
  const shadowX = offset.x * 0.6;
  const shadowY = offset.y * 0.6;

  return (
    <div
      className="absolute"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${size}%`,
        aspectRatio: "1 / 1",
        transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
        opacity: 0.9,
        willChange: "transform",
      }}
    >
      {/* Outer shadow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: `
            0 4px 8px rgba(0,0,0,0.4),
            0 2px 4px rgba(0,0,0,0.3),
            ${shadowX * 0.15}px ${shadowY * 0.15}px 6px rgba(0,0,0,0.5)
          `,
        }}
      />

      {/* Main eyeball gradient */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: `radial-gradient(
            circle at ${42 - offset.x * 1.5}% ${42 - offset.y * 1.5}%,
            ${EYEBALL_COLOR_INNER} 0%,
            ${EYEBALL_COLOR_OUTER} 50%,
            #000 85%,
            #000 100%
          )`,
          boxShadow: `
            inset ${-shadowX * 0.4}px ${-shadowY * 0.4}px 12px rgba(0,0,0,0.8),
            inset 0 0 20px rgba(0,0,0,0.6),
            inset ${shadowX * 0.2}px ${shadowY * 0.2}px 8px rgba(255,255,255,0.03)
          `,
        }}
      />

      {/* Inner depth ring */}
      <div
        className="absolute rounded-full"
        style={{
          inset: "10%",
          background: `radial-gradient(
            circle at ${40 - offset.x}% ${40 - offset.y}%,
            transparent 30%,
            rgba(0,0,0,0.4) 70%,
            rgba(0,0,0,0.6) 100%
          )`,
        }}
      />

      {/* Primary highlight */}
      <div
        className="absolute rounded-full"
        style={{
          width: `${HIGHLIGHT_SIZE}%`,
          aspectRatio: "1 / 1",
          left: `${HIGHLIGHT_OFFSET + highlightOffsetX}%`,
          top: `${HIGHLIGHT_OFFSET + highlightOffsetY}%`,
          background: `radial-gradient(circle, rgba(255,255,255,${HIGHLIGHT_OPACITY}) 0%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0) 70%)`,
          filter: "blur(0.5px)",
        }}
      />

      {/* Secondary highlight */}
      <div
        className="absolute rounded-full"
        style={{
          width: `${HIGHLIGHT_SIZE * 0.35}%`,
          aspectRatio: "1 / 1",
          left: `${HIGHLIGHT_OFFSET + 40 + highlightOffsetX * 0.5}%`,
          top: `${HIGHLIGHT_OFFSET + 30 + highlightOffsetY * 0.5}%`,
          background: `radial-gradient(circle, rgba(255,255,255,${HIGHLIGHT_OPACITY * 0.7}) 0%, rgba(255,255,255,0) 70%)`,
        }}
      />

      {/* Rim light */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `linear-gradient(${135 + Math.atan2(offset.y, offset.x) * (180 / Math.PI)}deg, transparent 50%, rgba(255,255,255,0.08) 100%)`,
        }}
      />

      {/* Bottom ambient reflection */}
      <div
        className="absolute rounded-full"
        style={{
          bottom: "5%",
          left: "20%",
          right: "20%",
          height: "15%",
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, transparent 70%)",
          filter: "blur(2px)",
        }}
      />
    </div>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}

function calculateEyeOffsets(
  cursorX: number,
  cursorY: number,
  leftEyeCenter: { x: number; y: number },
  rightEyeCenter: { x: number; y: number },
  containerWidth: number
): { left: { x: number; y: number }; right: { x: number; y: number } } {
  // Convert percentage constants to pixels based on container size
  const magnitude = containerWidth * (MOVEMENT_MAGNITUDE / 100);
  const convergenceMin = containerWidth * (CONVERGENCE_MIN_DISTANCE / 100);
  const convergenceMax = containerWidth * (CONVERGENCE_MAX_DISTANCE / 100);
  const proximityInner = containerWidth * (PROXIMITY_THRESHOLD_INNER / 100);
  const proximityOuter = containerWidth * (PROXIMITY_THRESHOLD_OUTER / 100);
  const maxTrackingInner = containerWidth * (MAX_TRACKING_DISTANCE_INNER / 100);
  const maxTrackingOuter = containerWidth * (MAX_TRACKING_DISTANCE_OUTER / 100);

  const eyesMidX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
  const eyesMidY = (leftEyeCenter.y + rightEyeCenter.y) / 2;
  const distToCursor = Math.hypot(cursorX - eyesMidX, cursorY - eyesMidY);

  // Far distance check - eyes fade to neutral when cursor is too far
  if (distToCursor > maxTrackingOuter) {
    return { left: { x: 0, y: 0 }, right: { x: 0, y: 0 } };
  }

  // Calculate far distance fade factor (1 = full tracking, 0 = no tracking)
  const farDistanceFactor = distToCursor <= maxTrackingInner
    ? 1
    : 1 - ((distToCursor - maxTrackingInner) / (maxTrackingOuter - maxTrackingInner));

  const leftDx = cursorX - leftEyeCenter.x;
  const leftDy = cursorY - leftEyeCenter.y;
  const leftDist = Math.hypot(leftDx, leftDy);

  const rightDx = cursorX - rightEyeCenter.x;
  const rightDy = cursorY - rightEyeCenter.y;
  const rightDist = Math.hypot(rightDx, rightDy);

  // Proximity check - eyes look forward when cursor is close
  const nearestEyeDist = Math.min(leftDist, rightDist);
  const proximityFactor = Math.max(0, Math.min(1,
    (nearestEyeDist - proximityInner) / (proximityOuter - proximityInner)
  ));

  if (proximityFactor === 0) {
    return { left: { x: 0, y: 0 }, right: { x: 0, y: 0 } };
  }

  // Convergence - blend between cross-eye and parallel gaze
  const normalizedDist = Math.max(0, Math.min(1,
    (distToCursor - convergenceMin) / (convergenceMax - convergenceMin)
  ));
  const convergenceFactor = 1 - normalizedDist * (1 - MIN_CONVERGENCE);

  const sharedDx = cursorX - eyesMidX;
  const sharedDy = cursorY - eyesMidY;
  const sharedDist = Math.hypot(sharedDx, sharedDy);

  const calculateBlendedOffset = (indDx: number, indDy: number, indDist: number) => {
    if (indDist === 0 && sharedDist === 0) return { x: 0, y: 0 };

    const indNormX = indDist > 0 ? indDx / indDist : 0;
    const indNormY = indDist > 0 ? indDy / indDist : 0;
    const sharedNormX = sharedDist > 0 ? sharedDx / sharedDist : 0;
    const sharedNormY = sharedDist > 0 ? sharedDy / sharedDist : 0;

    const blendedX = indNormX * convergenceFactor + sharedNormX * (1 - convergenceFactor);
    const blendedY = indNormY * convergenceFactor + sharedNormY * (1 - convergenceFactor);
    const blendedDist = Math.hypot(blendedX, blendedY);

    const finalNormX = blendedDist > 0 ? blendedX / blendedDist : 0;
    const finalNormY = blendedDist > 0 ? blendedY / blendedDist : 0;

    const distanceFactor = Math.min(distToCursor, magnitude * 15) / (magnitude * 15);
    const easedFactor = 1 - Math.pow(1 - distanceFactor, 2);

    return {
      x: finalNormX * magnitude * easedFactor * proximityFactor * farDistanceFactor,
      y: finalNormY * magnitude * easedFactor * proximityFactor * farDistanceFactor,
    };
  };

  return {
    left: calculateBlendedOffset(leftDx, leftDy, leftDist),
    right: calculateBlendedOffset(rightDx, rightDy, rightDist),
  };
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function MyFace() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const loadedCountRef = useRef(0);
  const hasTrackedInteraction = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const section2ProgressRef = useRef(0);
  const section2SmoothedRef = useRef(0);

  // Combined animation state - single state object for batched updates
  const initialGlintPos = -GLINT_WIDTH - GLINT_SKEW;
  const [animationState, setAnimationState] = useState({
    leftEye: { x: 0, y: 0 },
    rightEye: { x: 0, y: 0 },
    layer: { x: 0, y: 0 },
    perspective: { rotateX: 0, rotateY: 0 },
    leftGlint: initialGlintPos,
    rightGlint: initialGlintPos,
  });

  // Track last rendered values in ref (not state) for comparison
  const lastRendered = useRef({
    leftEye: { x: 0, y: 0 },
    rightEye: { x: 0, y: 0 },
    layer: { x: 0, y: 0 },
    perspective: { rotateX: 0, rotateY: 0 },
    leftGlint: initialGlintPos,
    rightGlint: initialGlintPos,
  });

  // Animation targets
  const targets = useRef({
    leftEye: { x: 0, y: 0 },
    rightEye: { x: 0, y: 0 },
    layer: { x: 0, y: 0 },
    perspective: { rotateX: 0, rotateY: 0 },
    leftGlint: -GLINT_WIDTH - GLINT_SKEW,
    rightGlint: -GLINT_WIDTH - GLINT_SKEW,
  });

  // Current animated values
  const current = useRef({
    leftEye: { x: 0, y: 0 },
    rightEye: { x: 0, y: 0 },
    layer: { x: 0, y: 0 },
    perspective: { rotateX: 0, rotateY: 0 },
    leftGlint: -GLINT_WIDTH - GLINT_SKEW,
    rightGlint: -GLINT_WIDTH - GLINT_SKEW,
  });

  const animationFrameRef = useRef<number | null>(null);

  const handleImageLoad = useCallback(() => {
    loadedCountRef.current += 1;
    if (loadedCountRef.current >= 5) { // BASE + OVERLAY + PERSISTENT_GLINT + 2x ANIMATED_GLINT
      setImagesLoaded(true);
    }
  }, []);

  // Animation loop - empty deps, compares against ref not state
  useEffect(() => {
    const animate = () => {
      // Smooth section 2 progress (same factor as MoonReveal: 0.2)
      section2SmoothedRef.current +=
        (section2ProgressRef.current - section2SmoothedRef.current) * 0.2;
      const s2p = section2SmoothedRef.current;

      // Scroll-driven face position (synced with moon reveal section 2)
      if (wrapperRef.current) {
        const scrollUp = s2p * 120;
        const faceOpacity = Math.max(0, 1 - s2p * 2);
        wrapperRef.current.style.transform = `translateX(-50%) translateY(calc(35% - ${scrollUp}vh))`;
        wrapperRef.current.style.opacity = String(faceOpacity);
      }

      const c = current.current;
      const t = targets.current;
      const last = lastRendered.current;

      // Lerp all values
      c.leftEye.x = lerp(c.leftEye.x, t.leftEye.x, SMOOTHING_FACTOR);
      c.leftEye.y = lerp(c.leftEye.y, t.leftEye.y, SMOOTHING_FACTOR);
      c.rightEye.x = lerp(c.rightEye.x, t.rightEye.x, SMOOTHING_FACTOR);
      c.rightEye.y = lerp(c.rightEye.y, t.rightEye.y, SMOOTHING_FACTOR);
      c.layer.x = lerp(c.layer.x, t.layer.x, PARALLAX_SMOOTHING);
      c.layer.y = lerp(c.layer.y, t.layer.y, PARALLAX_SMOOTHING);
      c.perspective.rotateX = lerp(c.perspective.rotateX, t.perspective.rotateX, PARALLAX_SMOOTHING);
      c.perspective.rotateY = lerp(c.perspective.rotateY, t.perspective.rotateY, PARALLAX_SMOOTHING);
      c.leftGlint = lerp(c.leftGlint, t.leftGlint, PARALLAX_SMOOTHING);
      c.rightGlint = lerp(c.rightGlint, t.rightGlint, PARALLAX_SMOOTHING);

      // Compare against REF (not state) to determine if update needed
      const eyeDiff = Math.abs(c.leftEye.x - last.leftEye.x) + Math.abs(c.leftEye.y - last.leftEye.y) +
                      Math.abs(c.rightEye.x - last.rightEye.x) + Math.abs(c.rightEye.y - last.rightEye.y);
      const layerDiff = Math.abs(c.layer.x - last.layer.x) + Math.abs(c.layer.y - last.layer.y);
      const perspectiveDiff = Math.abs(c.perspective.rotateX - last.perspective.rotateX) +
                              Math.abs(c.perspective.rotateY - last.perspective.rotateY);
      const glintDiff = Math.abs(c.leftGlint - last.leftGlint) + Math.abs(c.rightGlint - last.rightGlint);

      const needsUpdate = eyeDiff > 0.01 || layerDiff > 0.01 || perspectiveDiff > 0.001 || glintDiff > 0.1;

      if (needsUpdate) {
        // Update ref with new values
        last.leftEye = { ...c.leftEye };
        last.rightEye = { ...c.rightEye };
        last.layer = { ...c.layer };
        last.perspective = { ...c.perspective };
        last.leftGlint = c.leftGlint;
        last.rightGlint = c.rightGlint;

        // Single batched state update
        setAnimationState({
          leftEye: { ...c.leftEye },
          rightEye: { ...c.rightEye },
          layer: { ...c.layer },
          perspective: { ...c.perspective },
          leftGlint: c.leftGlint,
          rightGlint: c.rightGlint,
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []); // Empty deps - uses refs for all comparisons

  // Pointer movement handler
  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    // Track first interaction with eye tracker
    if (!hasTrackedInteraction.current) {
      hasTrackedInteraction.current = true;
      posthog.capture("eye_tracker_interaction", {
        interaction_type: "first_movement",
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
      });
    }

    const rect = containerRef.current.getBoundingClientRect();
    const t = targets.current;

    // Calculate eye tracking
    const leftEyeCenter = {
      x: rect.left + (LEFT_EYE.x / 100) * rect.width,
      y: rect.top + (LEFT_EYE.y / 100) * rect.height,
    };
    const rightEyeCenter = {
      x: rect.left + (RIGHT_EYE.x / 100) * rect.width,
      y: rect.top + (RIGHT_EYE.y / 100) * rect.height,
    };

    const offsets = calculateEyeOffsets(clientX, clientY, leftEyeCenter, rightEyeCenter, rect.width);
    t.leftEye = offsets.left;
    t.rightEye = offsets.right;

    // Calculate parallax (layers move opposite to cursor)
    // Convert percentage to pixels based on container width
    const layerMovementPx = rect.width * (LAYER_MOVEMENT / 100);
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxDist = Math.max(rect.width, rect.height);
    const normalizedX = (clientX - centerX) / maxDist;
    const normalizedY = (clientY - centerY) / maxDist;

    t.layer = {
      x: -normalizedX * layerMovementPx * 2,
      y: -normalizedY * layerMovementPx * 2,
    };

    t.perspective = {
      rotateX: -normalizedY * PERSPECTIVE_AMOUNT,
      rotateY: normalizedX * PERSPECTIVE_AMOUNT,
    };

    // Calculate glint position (tracks cursor between GLINT_RANGE_START-END % of screen width)
    const screenWidthPercent = (clientX / window.innerWidth) * 100;
    let normalizedPos = (screenWidthPercent - GLINT_RANGE_START) / (GLINT_RANGE_END - GLINT_RANGE_START);
    normalizedPos = Math.max(0, Math.min(1, normalizedPos));

    const glintStart = -GLINT_WIDTH - GLINT_SKEW;
    const glintEnd = 50 + GLINT_SKEW;

    t.leftGlint = glintStart + normalizedPos * (glintEnd - glintStart);
    const delayedPos = Math.max(0, normalizedPos - GLINT_RIGHT_DELAY) / (1 - GLINT_RIGHT_DELAY);
    t.rightGlint = glintStart + delayedPos * (glintEnd - glintStart);
  }, []);

  // Reset to fallback position
  const setFallbackPosition = useCallback(() => {
    const zero = { x: 0, y: 0 };
    const zeroPerspective = { rotateX: 0, rotateY: 0 };
    const glintOff = -GLINT_WIDTH - GLINT_SKEW;

    const resetState = {
      leftEye: zero,
      rightEye: zero,
      layer: zero,
      perspective: zeroPerspective,
      leftGlint: glintOff,
      rightGlint: glintOff,
    };

    targets.current = { ...resetState };
    current.current = { leftEye: { ...zero }, rightEye: { ...zero }, layer: { ...zero }, perspective: { ...zeroPerspective }, leftGlint: glintOff, rightGlint: glintOff };
    lastRendered.current = { leftEye: { ...zero }, rightEye: { ...zero }, layer: { ...zero }, perspective: { ...zeroPerspective }, leftGlint: glintOff, rightGlint: glintOff };

    setAnimationState(resetState);
  }, []);

  // Event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (!containerRef.current || e.beta === null || e.gamma === null) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Convert percentage to pixels based on container width
      const gyroSensitivityPx = rect.width * (GYRO_SENSITIVITY / 100);
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const simulatedX = centerX + (e.gamma - GYRO_CENTER_GAMMA) * gyroSensitivityPx;
      const simulatedY = centerY + (e.beta - GYRO_CENTER_BETA) * gyroSensitivityPx;
      handlePointerMove(simulatedX, simulatedY);
    };

    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    // Use requestAnimationFrame to defer state update and avoid synchronous setState warning
    if (isMobile) requestAnimationFrame(() => setFallbackPosition());

    const setupGyroscope = async () => {
      if (!isMobile) return;
      try {
        const DeviceOrientationEventTyped = DeviceOrientationEvent as unknown as {
          requestPermission?: () => Promise<"granted" | "denied">;
        };
        if (typeof DeviceOrientationEventTyped.requestPermission === "function") {
          const permission = await DeviceOrientationEventTyped.requestPermission();
          if (permission !== "granted") return;
        }
        window.addEventListener("deviceorientation", handleDeviceOrientation, { passive: true });
      } catch {
        // Gyroscope not available
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    setupGyroscope();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
    };
  }, [handlePointerMove, setFallbackPosition]);

  // ScrollTrigger: scroll face up as moon section approaches
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: "#moon-section",
      start: "top bottom",
      end: "top top",
      scrub: true,
      onUpdate: (self) => {
        section2ProgressRef.current = self.progress;
      },
    });

    return () => trigger.kill();
  }, []);

  // Common transform for all face layers
  const layerTransform = `translate(${animationState.layer.x}px, ${animationState.layer.y}px) perspective(1000px) rotateX(${animationState.perspective.rotateX}deg) rotateY(${animationState.perspective.rotateY}deg)`;

  // Animated glint mask helper (feathered left/right edges, sharp top/bottom)
  // Uses a linear gradient perpendicular to the diagonal stripe direction
  const getGlintMask = (pos: number, isRight: boolean) => {
    const offset = isRight ? 50 : 0;
    const min = isRight ? 50 : 0;
    const max = isRight ? 100 : 50;
    const clamp = (v: number) => Math.min(max, Math.max(min, v));

    // Calculate the stripe edges (average of top and bottom positions for gradient)
    const leftEdge = clamp(offset + pos + GLINT_SKEW / 2);
    const rightEdge = clamp(offset + pos + GLINT_WIDTH + GLINT_SKEW / 2);

    // Gradient angle: perpendicular to stripe direction (roughly horizontal, ~96deg due to skew)
    const angle = 90 + Math.atan2(GLINT_SKEW, 100) * (180 / Math.PI);

    // Create gradient with feathered left/right edges
    return `linear-gradient(
      ${angle.toFixed(1)}deg,
      transparent 0%,
      transparent ${Math.max(min, leftEdge - GLINT_FEATHER)}%,
      white ${leftEdge}%,
      white ${rightEdge}%,
      transparent ${Math.min(max, rightEdge + GLINT_FEATHER)}%,
      transparent 100%
    )`;
  };

  return (
    <div
      ref={wrapperRef}
      className="fixed bottom-0 left-1/2 z-[15] pointer-events-none select-none"
      style={{
        height: "min(100vh, 140vw)",
        aspectRatio: "550 / 800",
        transform: "translateX(-50%) translateY(35%)",
      }}
    >
      <div
        ref={containerRef}
        className="absolute inset-0"
      >
      <div className={`relative w-full h-full transition-opacity duration-300 ${imagesLoaded ? "opacity-100" : "opacity-0"}`}>

        {/* LAYER 1: BASE - Face with blank eye areas */}
        <div style={{ position: "absolute", inset: 0, transform: layerTransform, willChange: "transform", clipPath: "inset(0 0 35% 0)" }}>
          <Image
            src={FACE_LAYERS.BASE}
            alt="Adam"
            fill
            priority
            sizes="(max-width: 640px) 90vw, 450px"
            className="object-contain grayscale"
            onLoad={handleImageLoad}
            unoptimized
          />
        </div>

        {/* LAYER 2: EYEBALLS - Animated 3D eyeballs */}
        <div style={{ position: "absolute", inset: 0, transform: layerTransform, willChange: "transform", clipPath: "inset(0 0 35% 0)" }}>
          <Eyeball position={LEFT_EYE} offset={animationState.leftEye} size={EYEBALL_SIZE} />
          <Eyeball position={RIGHT_EYE} offset={animationState.rightEye} size={EYEBALL_SIZE} />
        </div>

        {/* LAYER 3: OVERLAY - Face with eye socket cutouts (masks eyeballs) */}
        <div style={{ position: "absolute", inset: 0, transform: layerTransform, willChange: "transform", clipPath: "inset(0 0 35% 0)" }}>
          <Image
            src={FACE_LAYERS.OVERLAY}
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 90vw, 450px"
            className="object-contain grayscale"
            onLoad={handleImageLoad}
            unoptimized
          />
        </div>

        {/* ================================================
            LAYER 4a: GLINT_PERSISTENT
            Always-visible subtle reflection that follows overlay transforms.
            Provides base ambient reflection on glasses.
            ================================================ */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: layerTransform,
            opacity: GLINT_PERSISTENT_OPACITY,
            willChange: "transform",
            pointerEvents: "none",
          }}
        >
          <Image
            src={FACE_LAYERS.GLINT}
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 90vw, 450px"
            className="object-contain"
            onLoad={handleImageLoad}
            unoptimized
          />
        </div>

        {/* ================================================
            LAYER 4b: GLINT_ANIMATED (Left Lens)
            Diagonal sweep glint with feathered left/right edges.
            Uses gradient mask for soft sides, sharp top/bottom.
            Triggered by cursor movement across screen.
            ================================================ */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: layerTransform,
            maskImage: getGlintMask(animationState.leftGlint, false),
            WebkitMaskImage: getGlintMask(animationState.leftGlint, false),
            opacity: GLINT_ANIMATED_OPACITY,
            willChange: "transform",
            pointerEvents: "none",
          }}
        >
          <Image
            src={FACE_LAYERS.GLINT}
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 90vw, 450px"
            className="object-contain"
            style={{ clipPath: "inset(0 50% 0 0)" }}
            onLoad={handleImageLoad}
            unoptimized
          />
        </div>

        {/* ================================================
            LAYER 4b: GLINT_ANIMATED (Right Lens)
            Diagonal sweep glint with feathered left/right edges.
            Uses gradient mask for soft sides, sharp top/bottom.
            Slightly delayed behind left lens for natural feel.
            ================================================ */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: layerTransform,
            maskImage: getGlintMask(animationState.rightGlint, true),
            WebkitMaskImage: getGlintMask(animationState.rightGlint, true),
            opacity: GLINT_ANIMATED_OPACITY,
            willChange: "transform",
            pointerEvents: "none",
          }}
        >
          <Image
            src={FACE_LAYERS.GLINT}
            alt=""
            fill
            sizes="(max-width: 640px) 90vw, 450px"
            className="object-contain"
            style={{ clipPath: "inset(0 0 0 50%)" }}
            onLoad={handleImageLoad}
            unoptimized
          />
        </div>
      </div>

      {/* Loading placeholder */}
      {!imagesLoaded && (
        <div className="absolute inset-0 animate-pulse bg-secondary/20 rounded-full" style={{ width: "100%", height: "100%" }} />
      )}
      </div>
    </div>
  );
}

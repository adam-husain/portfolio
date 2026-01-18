"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

// ============================================
// CONFIGURABLE CONSTANTS - Adjust these values
// ============================================

// Eye positions (percentage from top-left of container)
const LEFT_EYE = {
  x: 37.5, // percentage from left
  y: 49.5, // percentage from top
};

const RIGHT_EYE = {
  x: 61.5, // percentage from left
  y: 49.55, // percentage from top
};

// Eyeball size (percentage of container width)
const EYEBALL_SIZE = 4.5;

// Maximum movement magnitude (pixels the eyeball can move from center)
const MOVEMENT_MAGNITUDE = 10;

// Eye tracking tuning
const CONVERGENCE_MIN_DISTANCE = 100; // Below this distance, full convergence (cross-eye)
const CONVERGENCE_MAX_DISTANCE = 500; // Above this distance, parallel gaze
const MIN_CONVERGENCE = 0.15; // Minimum convergence factor (0 = fully parallel)
const SMOOTHING_FACTOR = 0.15; // Lower = smoother but slower (0.1 - 0.3 recommended)

// Close proximity settings (eyes look forward when cursor is near)
const PROXIMITY_THRESHOLD_INNER = 50; // Below this distance to nearest eye, fully look forward
const PROXIMITY_THRESHOLD_OUTER = 150; // Above this distance, normal tracking resumes

// Eyeball colors (iris gradient)
const EYEBALL_COLOR_OUTER = "#0a0a0a";
const EYEBALL_COLOR_INNER = "#2a2a2a";

// Highlight settings
const HIGHLIGHT_SIZE = 30; // percentage of eyeball size
const HIGHLIGHT_OFFSET = 25; // percentage offset from center
const HIGHLIGHT_OPACITY = 0.9;

// 3D parallax settings
const BASE_MOVEMENT = 1; // Max pixels the base moves (less than overlay for depth)
const OVERLAY_MOVEMENT = 2; // Max pixels the overlay moves
const PARALLAX_SMOOTHING = 0.08; // Slower than eyes for subtle effect
const PERSPECTIVE_AMOUNT = 2; // Max degrees of rotation for perspective tilt

// Gyroscope settings (mobile)
const GYRO_SENSITIVITY = 15; // How much device tilt affects movement (higher = more sensitive)
const GYRO_CENTER_BETA = 45; // Neutral phone tilt angle (front-to-back, ~45° is natural holding angle)
const GYRO_CENTER_GAMMA = 0; // Neutral left-right tilt

// Fallback position when gyro unavailable (eyes look forward)
const FALLBACK_OFFSET = { x: 0, y: 0 };

// ============================================

// Base image (face without eyeballs)
const BASE_IMAGE = "/images/mine/adam_background-eyeballs-removebg.png";
// Overlay image (whites of eyes only, to mask eyeballs)
const OVERLAY_IMAGE = "/images/mine/adam_background-removebg.png";

// Eyeball component with 3D lighting
interface EyeballProps {
  position: { x: number; y: number };
  offset: { x: number; y: number };
  size: number;
}

function Eyeball({ position, offset, size }: EyeballProps) {
  // Calculate highlight position (moves opposite to eye movement for parallax)
  const highlightOffsetX = -offset.x * 0.4;
  const highlightOffsetY = -offset.y * 0.4;

  // Calculate shadow direction based on movement
  const shadowX = offset.x * 0.6;
  const shadowY = offset.y * 0.6;

  return (
    <div
      className="absolute"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${size}%`,
        aspectRatio: "1 / 1", // Force perfect circle
        transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
        opacity: 0.9,
        willChange: "transform", // Optimize for animations
      }}
    >
      {/* Outer shadow for depth */}
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

      {/* Main eyeball with deep gradient */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: `
            radial-gradient(
              circle at ${42 - offset.x * 1.5}% ${42 - offset.y * 1.5}%,
              ${EYEBALL_COLOR_INNER} 0%,
              ${EYEBALL_COLOR_OUTER} 50%,
              #000 85%,
              #000 100%
            )
          `,
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
          background: `
            radial-gradient(
              circle at ${40 - offset.x}% ${40 - offset.y}%,
              transparent 30%,
              rgba(0,0,0,0.4) 70%,
              rgba(0,0,0,0.6) 100%
            )
          `,
        }}
      />

      {/* Primary highlight (top-left specular) */}
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

      {/* Secondary smaller highlight */}
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

      {/* Rim light that follows gaze */}
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
          background: `radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, transparent 70%)`,
          filter: "blur(2px)",
        }}
      />
    </div>
  );
}

// Calculate eye offsets for both eyes with reduced cross-eye effect
function calculateEyeOffsets(
  cursorX: number,
  cursorY: number,
  leftEyeCenterX: number,
  leftEyeCenterY: number,
  rightEyeCenterX: number,
  rightEyeCenterY: number,
  magnitude: number
): { left: { x: number; y: number }; right: { x: number; y: number } } {
  // Calculate midpoint between eyes
  const eyesMidX = (leftEyeCenterX + rightEyeCenterX) / 2;
  const eyesMidY = (leftEyeCenterY + rightEyeCenterY) / 2;

  // Distance from cursor to eye midpoint
  const distToCursor = Math.sqrt(
    Math.pow(cursorX - eyesMidX, 2) + Math.pow(cursorY - eyesMidY, 2)
  );

  // Individual directions for each eye
  const leftDx = cursorX - leftEyeCenterX;
  const leftDy = cursorY - leftEyeCenterY;
  const leftDist = Math.sqrt(leftDx * leftDx + leftDy * leftDy);

  const rightDx = cursorX - rightEyeCenterX;
  const rightDy = cursorY - rightEyeCenterY;
  const rightDist = Math.sqrt(rightDx * rightDx + rightDy * rightDy);

  // Calculate proximity factor based on nearest eye
  // When cursor is close to either eye, eyes look forward
  const nearestEyeDist = Math.min(leftDist, rightDist);
  const proximityFactor = Math.max(0, Math.min(1,
    (nearestEyeDist - PROXIMITY_THRESHOLD_INNER) / (PROXIMITY_THRESHOLD_OUTER - PROXIMITY_THRESHOLD_INNER)
  ));

  // If cursor is very close to an eye, return forward gaze
  if (proximityFactor === 0) {
    return {
      left: { x: 0, y: 0 },
      right: { x: 0, y: 0 },
    };
  }

  // Convergence factor: higher = more cross-eye, lower = more parallel
  // Ranges from MIN_CONVERGENCE to 1 based on distance
  const normalizedDist = Math.max(0, Math.min(1,
    (distToCursor - CONVERGENCE_MIN_DISTANCE) / (CONVERGENCE_MAX_DISTANCE - CONVERGENCE_MIN_DISTANCE)
  ));
  const convergenceFactor = 1 - normalizedDist * (1 - MIN_CONVERGENCE);

  // Shared direction (from midpoint to cursor) - used for parallel gaze
  const sharedDx = cursorX - eyesMidX;
  const sharedDy = cursorY - eyesMidY;
  const sharedDist = Math.sqrt(sharedDx * sharedDx + sharedDy * sharedDy);

  // Calculate blended offsets
  const calculateBlendedOffset = (
    individualDx: number,
    individualDy: number,
    individualDist: number
  ): { x: number; y: number } => {
    if (individualDist === 0 && sharedDist === 0) {
      return { x: 0, y: 0 };
    }

    // Normalized individual direction
    const indNormX = individualDist > 0 ? individualDx / individualDist : 0;
    const indNormY = individualDist > 0 ? individualDy / individualDist : 0;

    // Normalized shared direction
    const sharedNormX = sharedDist > 0 ? sharedDx / sharedDist : 0;
    const sharedNormY = sharedDist > 0 ? sharedDy / sharedDist : 0;

    // Blend between individual (cross-eye) and shared (parallel) directions
    const blendedX = indNormX * convergenceFactor + sharedNormX * (1 - convergenceFactor);
    const blendedY = indNormY * convergenceFactor + sharedNormY * (1 - convergenceFactor);

    // Normalize the blended direction
    const blendedDist = Math.sqrt(blendedX * blendedX + blendedY * blendedY);
    const finalNormX = blendedDist > 0 ? blendedX / blendedDist : 0;
    const finalNormY = blendedDist > 0 ? blendedY / blendedDist : 0;

    // Apply magnitude with easing based on distance
    const distanceFactor = Math.min(distToCursor, magnitude * 15) / (magnitude * 15);
    // Use ease-out curve for more natural movement
    const easedFactor = 1 - Math.pow(1 - distanceFactor, 2);

    // Apply proximity factor to blend toward forward gaze when close
    return {
      x: finalNormX * magnitude * easedFactor * proximityFactor,
      y: finalNormY * magnitude * easedFactor * proximityFactor,
    };
  };

  return {
    left: calculateBlendedOffset(leftDx, leftDy, leftDist),
    right: calculateBlendedOffset(rightDx, rightDy, rightDist),
  };
}

// Smooth interpolation helper (lerp)
function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}

export default function EyeTrackerBall() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftEyeOffset, setLeftEyeOffset] = useState({ x: 0, y: 0 });
  const [rightEyeOffset, setRightEyeOffset] = useState({ x: 0, y: 0 });
  const [baseOffset, setBaseOffset] = useState({ x: 0, y: 0 });
  const [overlayOffset, setOverlayOffset] = useState({ x: 0, y: 0 });
  const [perspective, setPerspective] = useState({ rotateX: 0, rotateY: 0 });
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const loadedCountRef = useRef(0);

  // Refs for smooth animation
  const targetLeftOffset = useRef({ x: 0, y: 0 });
  const targetRightOffset = useRef({ x: 0, y: 0 });
  const targetBaseOffset = useRef({ x: 0, y: 0 });
  const targetOverlayOffset = useRef({ x: 0, y: 0 });
  const targetPerspective = useRef({ rotateX: 0, rotateY: 0 });
  const currentLeftOffset = useRef({ x: 0, y: 0 });
  const currentRightOffset = useRef({ x: 0, y: 0 });
  const currentBaseOffset = useRef({ x: 0, y: 0 });
  const currentOverlayOffset = useRef({ x: 0, y: 0 });
  const currentPerspective = useRef({ rotateX: 0, rotateY: 0 });
  const animationFrameRef = useRef<number | null>(null);

  const handleImageLoad = useCallback(() => {
    loadedCountRef.current += 1;
    if (loadedCountRef.current >= 2) {
      setImagesLoaded(true);
    }
  }, []);

  // Smooth animation loop
  useEffect(() => {
    const animate = () => {
      // Lerp current position towards target
      currentLeftOffset.current = {
        x: lerp(currentLeftOffset.current.x, targetLeftOffset.current.x, SMOOTHING_FACTOR),
        y: lerp(currentLeftOffset.current.y, targetLeftOffset.current.y, SMOOTHING_FACTOR),
      };
      currentRightOffset.current = {
        x: lerp(currentRightOffset.current.x, targetRightOffset.current.x, SMOOTHING_FACTOR),
        y: lerp(currentRightOffset.current.y, targetRightOffset.current.y, SMOOTHING_FACTOR),
      };
      currentBaseOffset.current = {
        x: lerp(currentBaseOffset.current.x, targetBaseOffset.current.x, PARALLAX_SMOOTHING),
        y: lerp(currentBaseOffset.current.y, targetBaseOffset.current.y, PARALLAX_SMOOTHING),
      };
      currentOverlayOffset.current = {
        x: lerp(currentOverlayOffset.current.x, targetOverlayOffset.current.x, PARALLAX_SMOOTHING),
        y: lerp(currentOverlayOffset.current.y, targetOverlayOffset.current.y, PARALLAX_SMOOTHING),
      };
      currentPerspective.current = {
        rotateX: lerp(currentPerspective.current.rotateX, targetPerspective.current.rotateX, PARALLAX_SMOOTHING),
        rotateY: lerp(currentPerspective.current.rotateY, targetPerspective.current.rotateY, PARALLAX_SMOOTHING),
      };

      // Only update state if there's meaningful change (optimization)
      const leftDiff = Math.abs(currentLeftOffset.current.x - leftEyeOffset.x) +
                       Math.abs(currentLeftOffset.current.y - leftEyeOffset.y);
      const rightDiff = Math.abs(currentRightOffset.current.x - rightEyeOffset.x) +
                        Math.abs(currentRightOffset.current.y - rightEyeOffset.y);
      const baseDiff = Math.abs(currentBaseOffset.current.x - baseOffset.x) +
                       Math.abs(currentBaseOffset.current.y - baseOffset.y);
      const overlayDiff = Math.abs(currentOverlayOffset.current.x - overlayOffset.x) +
                          Math.abs(currentOverlayOffset.current.y - overlayOffset.y);
      const perspectiveDiff = Math.abs(currentPerspective.current.rotateX - perspective.rotateX) +
                              Math.abs(currentPerspective.current.rotateY - perspective.rotateY);

      if (leftDiff > 0.01 || rightDiff > 0.01) {
        setLeftEyeOffset({ ...currentLeftOffset.current });
        setRightEyeOffset({ ...currentRightOffset.current });
      }
      if (baseDiff > 0.01) {
        setBaseOffset({ ...currentBaseOffset.current });
      }
      if (overlayDiff > 0.01) {
        setOverlayOffset({ ...currentOverlayOffset.current });
      }
      if (perspectiveDiff > 0.001) {
        setPerspective({ ...currentPerspective.current });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [leftEyeOffset, rightEyeOffset, baseOffset, overlayOffset, perspective]);

  // Handle mouse/touch movement
  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    // Calculate eye centers in screen coordinates
    const leftEyeCenterX = rect.left + (LEFT_EYE.x / 100) * rect.width;
    const leftEyeCenterY = rect.top + (LEFT_EYE.y / 100) * rect.height;
    const rightEyeCenterX = rect.left + (RIGHT_EYE.x / 100) * rect.width;
    const rightEyeCenterY = rect.top + (RIGHT_EYE.y / 100) * rect.height;

    // Calculate blended offsets for both eyes (reduces cross-eye effect)
    const offsets = calculateEyeOffsets(
      clientX,
      clientY,
      leftEyeCenterX,
      leftEyeCenterY,
      rightEyeCenterX,
      rightEyeCenterY,
      MOVEMENT_MAGNITUDE
    );

    // Update targets (animation loop will smoothly interpolate)
    targetLeftOffset.current = offsets.left;
    targetRightOffset.current = offsets.right;

    // Calculate parallax offsets (subtle 3D effect)
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const maxDist = Math.max(rect.width, rect.height);
    const normalizedX = dx / maxDist;
    const normalizedY = dy / maxDist;

    // Base moves less than overlay for layered depth effect
    targetBaseOffset.current = {
      x: normalizedX * BASE_MOVEMENT * 2,
      y: normalizedY * BASE_MOVEMENT * 2,
    };

    targetOverlayOffset.current = {
      x: normalizedX * OVERLAY_MOVEMENT * 2,
      y: normalizedY * OVERLAY_MOVEMENT * 2,
    };

    // Perspective tilt (rotateX is inverted for natural feel)
    targetPerspective.current = {
      rotateX: -normalizedY * PERSPECTIVE_AMOUNT,
      rotateY: normalizedX * PERSPECTIVE_AMOUNT,
    };
  }, []);

  // Set fallback position (eyes look forward) - sets both state and targets for immediate effect
  const setFallbackPosition = useCallback(() => {
    const noOffset = { x: 0, y: 0 };
    const noPerspective = { rotateX: 0, rotateY: 0 };

    // Set targets
    targetLeftOffset.current = FALLBACK_OFFSET;
    targetRightOffset.current = FALLBACK_OFFSET;
    targetBaseOffset.current = noOffset;
    targetOverlayOffset.current = noOffset;
    targetPerspective.current = noPerspective;

    // Set state directly for immediate effect
    currentLeftOffset.current = FALLBACK_OFFSET;
    currentRightOffset.current = FALLBACK_OFFSET;
    currentBaseOffset.current = noOffset;
    currentOverlayOffset.current = noOffset;
    currentPerspective.current = noPerspective;

    setLeftEyeOffset(FALLBACK_OFFSET);
    setRightEyeOffset(FALLBACK_OFFSET);
    setBaseOffset(noOffset);
    setOverlayOffset(noOffset);
    setPerspective(noPerspective);
  }, []);

  // Set up event listeners
  useEffect(() => {
    let gyroActive = false;

    const handleMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    // Gyroscope handler for mobile devices
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (!containerRef.current || e.beta === null || e.gamma === null) return;

      gyroActive = true;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Convert gyro angles to offset from center
      // beta: front-to-back tilt (-180 to 180, but typically 0-90 when upright)
      // gamma: left-to-right tilt (-90 to 90)
      const betaOffset = (e.beta - GYRO_CENTER_BETA) * GYRO_SENSITIVITY;
      const gammaOffset = (e.gamma - GYRO_CENTER_GAMMA) * GYRO_SENSITIVITY;

      // Simulate cursor position based on gyro tilt
      const simulatedX = centerX + gammaOffset;
      const simulatedY = centerY + betaOffset;

      handlePointerMove(simulatedX, simulatedY);
    };

    // Check if device is mobile (no fine pointer)
    const isMobile = window.matchMedia("(pointer: coarse)").matches;

    // On mobile, set fallback immediately - gyro will override if it works
    if (isMobile) {
      setFallbackPosition();
    }

    // Try to set up gyroscope for mobile
    const setupGyroscope = async () => {
      if (!isMobile) return;

      try {
        // iOS 13+ requires permission request
        const DeviceOrientationEventTyped = DeviceOrientationEvent as unknown as {
          requestPermission?: () => Promise<"granted" | "denied">;
        };

        if (typeof DeviceOrientationEventTyped.requestPermission === "function") {
          const permission = await DeviceOrientationEventTyped.requestPermission();
          if (permission !== "granted") {
            return; // Keep fallback position
          }
        }

        window.addEventListener("deviceorientation", handleDeviceOrientation, { passive: true });
      } catch {
        // Gyroscope not available or permission denied - fallback already set
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

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 left-1/2 z-20 pointer-events-none select-none"
      style={{
        transform: "translateX(-50%) translateY(35%)",
        width: "min(550px, 95vw)",
        aspectRatio: "550 / 800",
      }}
    >
      {/* Container for all layers */}
      <div
        className={`relative w-full h-full transition-opacity duration-300 ${
          imagesLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Layer 1: Base image (face without eyeballs) with 3D parallax */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translate(${baseOffset.x}px, ${baseOffset.y}px) perspective(1000px) rotateX(${perspective.rotateX}deg) rotateY(${perspective.rotateY}deg)`,
            willChange: "transform",
          }}
        >
          <Image
            src={BASE_IMAGE}
            alt="Adam"
            fill
            priority
            sizes="(max-width: 640px) 90vw, 450px"
            className="object-contain grayscale"
            onLoad={handleImageLoad}
            unoptimized
          />
        </div>

        {/* Layer 2: Eyeballs with 3D lighting */}
        <Eyeball position={LEFT_EYE} offset={leftEyeOffset} size={EYEBALL_SIZE} />
        <Eyeball position={RIGHT_EYE} offset={rightEyeOffset} size={EYEBALL_SIZE} />

        {/* Layer 3: Overlay (whites of eyes to mask eyeballs) with 3D parallax */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translate(${overlayOffset.x}px, ${overlayOffset.y}px) perspective(1000px) rotateX(${perspective.rotateX}deg) rotateY(${perspective.rotateY}deg)`,
            willChange: "transform",
          }}
        >
          <Image
            src={OVERLAY_IMAGE}
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 90vw, 450px"
            className="object-contain grayscale"
            onLoad={handleImageLoad}
            unoptimized
          />
        </div>
      </div>

      {/* Loading placeholder */}
      {!imagesLoaded && (
        <div
          className="absolute inset-0 animate-pulse bg-secondary/20 rounded-full"
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      )}
    </div>
  );
}

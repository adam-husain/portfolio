"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

// Image angles in degrees (0 = left, 180 = right, 90 = up)
// Using the angle as a reference for where the eyes are looking
const ANGLE_IMAGES = [
  { angle: 0, src: "/images/mine/adam_0-removebg.png" },
  { angle: 40, src: "/images/mine/adam_40-removebg.png" },
  { angle: 90, src: "/images/mine/adam_90-removebg.png" },
  { angle: 140, src: "/images/mine/adam_140-removebg.png" },
  { angle: 180, src: "/images/mine/adam_180-removebg.png" },
];
const STRAIGHT_IMAGE = "/images/mine/adam_straight-removebg.png";

// Calculate angle from center to cursor (0=looking left, 90=looking up, 180=looking right)
// Adam should LOOK TOWARD the cursor
function calculateAngle(
  cursorX: number,
  cursorY: number,
  centerX: number,
  centerY: number
): number {
  const dx = cursorX - centerX;
  const dy = centerY - cursorY; // Positive when cursor is above center

  // If cursor is below the horizontal center line, clamp to left (0) or right (180)
  if (dy < 0) {
    return dx < 0 ? 0 : 180;
  }

  // atan2 gives angle from positive X axis, counter-clockwise
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // Convert: cursor on RIGHT → 180° (look right), cursor on LEFT → 0° (look left)
  return Math.min(180, Math.max(0, 180 - angle));
}

// Calculate weights for blending between images based on angle
function calculateWeights(angle: number): { index1: number; index2: number; t: number } {
  // Find the two closest angles and interpolate between them
  for (let i = 0; i < ANGLE_IMAGES.length - 1; i++) {
    if (angle >= ANGLE_IMAGES[i].angle && angle <= ANGLE_IMAGES[i + 1].angle) {
      const range = ANGLE_IMAGES[i + 1].angle - ANGLE_IMAGES[i].angle;
      const t = (angle - ANGLE_IMAGES[i].angle) / range;
      return { index1: i, index2: i + 1, t };
    }
  }

  // Edge cases
  if (angle <= ANGLE_IMAGES[0].angle) {
    return { index1: 0, index2: 0, t: 0 };
  }
  return { index1: ANGLE_IMAGES.length - 1, index2: ANGLE_IMAGES.length - 1, t: 0 };
}

export default function EyeTracker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndices, setActiveIndices] = useState<{ index1: number; index2: number; t: number }>({
    index1: 2, // Start looking up (90 degrees)
    index2: 2,
    t: 0,
  });
  const [isOnImage, setIsOnImage] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const loadedCountRef = useRef(0);

  const handleImageLoad = useCallback(() => {
    loadedCountRef.current += 1;
    if (loadedCountRef.current >= ANGLE_IMAGES.length + 1) {
      setImagesLoaded(true);
    }
  }, []);

  // Handle mouse/touch movement
  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 4; // Adjust center for face position (upper portion visible)

    // Check if cursor is on the image
    const onImage =
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom;

    setIsOnImage(onImage);

    if (!onImage) {
      const angle = calculateAngle(clientX, clientY, centerX, centerY);
      setActiveIndices(calculateWeights(angle));
    }
  }, []);

  // Set up event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [handlePointerMove]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 left-1/2 z-20 pointer-events-none select-none"
      style={{
        transform: "translateX(-50%) translateY(40%)",
        width: "min(450px, 90vw)",
        height: "min(650px, 90vw)",
      }}
    >
      {/* Container for all images - stacked */}
      <div
        className={`relative w-full h-full transition-opacity duration-300 ${
          imagesLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Straight ahead image (shown when cursor is on image) */}
        <Image
          src={STRAIGHT_IMAGE}
          alt="Adam looking at you"
          fill
          priority
          sizes="(max-width: 640px) 90vw, 400px"
          className="object-contain transition-opacity duration-150 ease-out grayscale"
          style={{
            opacity: isOnImage ? 1 : 0,
          }}
          onLoad={handleImageLoad}
        />

        {/* Angle-based images */}
        {ANGLE_IMAGES.map((img, index) => {
          let opacity = 0;

          if (!isOnImage) {
            if (index === activeIndices.index1) {
              opacity = 1 - activeIndices.t;
            } else if (index === activeIndices.index2) {
              opacity = activeIndices.t;
            }
          }

          return (
            <Image
              key={img.angle}
              src={img.src}
              alt={`Adam looking at ${img.angle} degrees`}
              fill
              priority
              sizes="(max-width: 640px) 90vw, 400px"
              className="object-contain transition-opacity duration-150 ease-out grayscale"
              style={{
                opacity,
              }}
              onLoad={handleImageLoad}
            />
          );
        })}
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

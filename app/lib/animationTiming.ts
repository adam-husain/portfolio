/**
 * Global Animation Timing Configuration
 *
 * This file centralizes all scroll-driven animation timing across sections.
 * All values are expressed as progress (0-1) within their respective sections.
 *
 * Section order:
 * 1. Hero (Section 1) - Static intro
 * 2. Moon Reveal (Section 2) - Rocket flies, moon reveals
 * 3. Orbital View (Section 3) - Satellite/Endurance orbits, moon shrinks to corner
 * 4. Atmospheric Re-entry (Section 4) - Asteroids burn, balloon rises
 * 5. Cloudscape (Section 5) - Coming soon
 * 6. Cityscape (Section 6) - Coming soon
 */

// ============================================================
// SECTION 2: MOON REVEAL
// ============================================================
export const SECTION2_TIMING = {
  // Moon mask reveal
  mask: {
    start: 0,
    end: 1,
  },
  // Text fade in/out
  text: {
    fadeInStart: 0.5,
    fadeInEnd: 0.8,
    // Fades out based on section 3 progress (0.2-0.5)
  },
  // Moon vertical position (percentage of its height)
  moon: {
    startYPercent: 55,
    endYPercent: 50,
    startBrightness: 1,
    endBrightness: 0.5,
  },
};

// ============================================================
// SECTION 3: ORBITAL VIEW (Satellite/Endurance)
// ============================================================
export const SECTION3_TIMING = {
  // Satellite/Endurance animation
  satellite: {
    // Main animation completes at 80%, then slows for persistence
    mainAnimationEnd: 0.8,
    appearThreshold: 0.02,
  },
  // Text timing (relative to section 3 progress)
  text: {
    fadeInStart: 0.2,
    fadeInEnd: 0.5,
    // Fades out based on section 4 progress
  },
  // Moon movement to corner
  moon: {
    endScale: 0.19,
    endLeftVw: 5,
    endTopVh: 10,
    endRotation: 60,
  },
  // When to start fading out (based on section 4 progress)
  fadeOut: {
    start: 0,      // Start fading when section 4 begins
    end: 0.25,     // Fully faded by 25% into section 4
  },
};

// ============================================================
// SECTION 4: ATMOSPHERIC RE-ENTRY
// ============================================================
export const SECTION4_TIMING = {
  // Asteroids phase
  asteroids: {
    start: 0,
    end: 0.5,      // Asteroids finish by 50% of section
  },
  // Balloon phase (starts after asteroids)
  balloon: {
    start: 0.5,    // Balloon appears at 50% of section
    end: 1,
  },
  // Text timing
  text: {
    fadeInStart: 0.55,
    fadeInEnd: 0.85,
  },
  // Heat/flame effects
  flames: {
    activeStart: 0.05,
    activeEnd: 0.85,
  },
};

// ============================================================
// SECTION 6: CITYSCAPE - TYPEWRITER EFFECT
// ============================================================
export const TYPEWRITER_TIMING = {
  typeSpeed: 50,           // ms per character when typing
  deleteSpeed: 80,         // ms per character when deleting (faster than typing)
  pauseAfterType: 2000,    // ms to pause after word is fully typed
  pauseAfterDelete: 300,   // ms to pause after word is fully deleted
};

// ============================================================
// CROSS-SECTION FADE TIMING
// ============================================================
export const FADE_TIMING = {
  // Section 2 text fades out during section 3
  section2TextFadeOut: {
    basedOnSection3: true,
    start: 0.2,
    end: 0.5,
  },
  // Section 3 elements (moon, satellite, text) fade out during section 4
  section3FadeOut: {
    basedOnSection4: true,
    start: 0,
    end: 0.25,
  },
  // Section 3 text fades out during section 4
  section3TextFadeOut: {
    basedOnSection4: true,
    start: 0.1,
    end: 0.4,
  },
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Maps a value from one range to another, clamped to output range
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number = 0,
  outMax: number = 1
): number {
  if (inMax === inMin) return outMin;
  const mapped = ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
  return Math.max(outMin, Math.min(outMax, mapped));
}

/**
 * Calculates fade-out progress based on another section's progress
 * Returns 1 when not fading, 0 when fully faded
 */
export function calculateFadeOut(
  otherSectionProgress: number,
  fadeStart: number,
  fadeEnd: number
): number {
  return Math.max(0, 1 - mapRange(otherSectionProgress, fadeStart, fadeEnd));
}

/**
 * Calculates fade-in progress
 * Returns 0 before start, 1 after end
 */
export function calculateFadeIn(
  progress: number,
  fadeStart: number,
  fadeEnd: number
): number {
  return mapRange(progress, fadeStart, fadeEnd);
}

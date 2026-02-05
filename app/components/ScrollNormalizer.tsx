"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * ScrollNormalizer Component
 *
 * Enables GSAP ScrollTrigger's normalizeScroll feature to fix scrolling issues
 * on Windows Precision Touchpads which fire wheel events at very high frequencies.
 *
 * This forces scrolling to be handled on the JavaScript thread, ensuring:
 * - Synchronized screen updates with animations
 * - Consistent momentum scrolling across devices
 * - Prevention of jittery/laggy behavior from high-frequency wheel events
 *
 * @see https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.normalizeScroll()
 */
export default function ScrollNormalizer() {
  useEffect(() => {
    // Configure ScrollTrigger for better mobile handling
    ScrollTrigger.config({
      // Skip refreshes when mobile address bar shows/hides
      ignoreMobileResize: true,
    });

    // Skip scroll normalization on touch/mobile devices
    // normalizeScroll is only needed for Windows Precision Touchpads (desktop)
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) {
      return;
    }

    // Enable scroll normalization for wheel events only (desktop)
    // This intercepts wheel behavior and handles it on the JS thread
    ScrollTrigger.normalizeScroll({
      // Allow nested scrollable elements to still work
      allowNestedScroll: true,
      // Lock to vertical axis to prevent diagonal drift on touchpads
      lockAxis: false,
      // Momentum function: controls how long momentum continues after flick-scrolling
      // Lower values = less momentum, which can help with precision touchpad issues
      momentum: (self: { velocityY: number }) => Math.min(2, self.velocityY / 1000),
      // Only normalize wheel events (mouse/touchpad), not touch
      type: "wheel",
    });

    // Disable GSAP's lag smoothing to prevent delays in scroll animations
    // This ensures immediate response to scroll input
    gsap.ticker.lagSmoothing(0);

    return () => {
      // Disable normalization on cleanup
      ScrollTrigger.normalizeScroll(false);
      // Re-enable default lag smoothing
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, []);

  return null;
}

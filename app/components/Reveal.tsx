"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "../lib/gsap";

// ============================================================
// REVEAL
// ============================================================
// Generic scroll-reveal wrapper. The hidden state is applied via
// gsap.set at runtime, never authored in JSX, so crawlers,
// noscript users, and reduced-motion users always see content.
// matchMedia auto-reverts if the OS motion setting flips live.
// ============================================================

type RevealProps = {
  children: ReactNode;
  y?: number;
  delay?: number;
};

export default function Reveal({ children, y = 24, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(el, { opacity: 0, y });
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        delay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 82%",
          toggleActions: "play none none none",
        },
      });
    });

    return () => mm.revert();
  }, [y, delay]);

  return <div ref={ref}>{children}</div>;
}

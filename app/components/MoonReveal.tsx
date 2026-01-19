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

  useEffect(() => {
    if (!maskRef.current || !moonRef.current || !glowRef.current) return;

    const ctx = gsap.context(() => {
      // Animate the curved mask from 0% to 120% based on scroll
      gsap.to(maskRef.current, {
        "--mask-progress": "120%",
        ease: "none",
        scrollTrigger: {
          trigger: "#moon-section",
          start: "top bottom",
          end: "top top",
          scrub: true,
        },
      });

      // Animate moon transform as you scroll
      gsap.fromTo(
        moonRef.current,
        { xPercent: -50, yPercent: MOON_START_Y },
        {
          xPercent: -50,
          yPercent: MOON_END_Y,
          ease: "none",
          scrollTrigger: {
            trigger: "#moon-section",
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        }
      );

      // Animate glow - fade IN when scroll starts
      gsap.fromTo(
        glowRef.current,
        { opacity: 0, "--glow-y": "100%" },
        {
          opacity: 1,
          "--glow-y": "30%",
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#moon-section",
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        }
      );
    });

    return () => ctx.revert();
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
      </div>
    </>
  );
}

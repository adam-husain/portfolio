'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';

interface ParallaxState {
  x: number;
  y: number;
}

interface CloudLayer {
  src: string;
  alt: string;
  position: 'left' | 'right';
  parallaxMultiplier?: number;
  zIndex?: number;
  // Desktop positioning
  offset: { x: string; y: string };
  size: string;
  // Mobile positioning
  mobileOffset: { x: string; y: string };
  mobileSize: string;
  opacity: number;
  blur?: number;
  rotate?: number;
  flip?: boolean;
  hidden?: boolean;
  mobileHidden?: boolean;
}

export default function CloudAtmosphere() {
  const [mounted, setMounted] = useState(false);

  // Use refs instead of state for animation values to avoid re-renders
  const parallaxRef = useRef<ParallaxState>({ x: 0, y: 0 });
  const smoothParallaxRef = useRef<ParallaxState>({ x: 0, y: 0 });
  const cloudRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (typeof window === 'undefined') return;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const x = (clientX - centerX) / centerX;
    const y = (clientY - centerY) / centerY;

    // Update ref instead of state - no re-render triggered
    parallaxRef.current = { x: x * 25, y: y * 15 };
  }, []);

  useEffect(() => {
    setMounted(true);

    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [handlePointerMove]);

  // Store cloudLayers data in a ref so animation loop can access it
  const cloudLayersRef = useRef<CloudLayer[]>([]);

  useEffect(() => {
    if (!mounted) return;

    let animationId: number;
    const SMOOTHING = 0.06;

    const animate = () => {
      const target = parallaxRef.current;
      const smooth = smoothParallaxRef.current;

      // Lerp smooth values toward target
      const newX = smooth.x + (target.x - smooth.x) * SMOOTHING;
      const newY = smooth.y + (target.y - smooth.y) * SMOOTHING;
      smoothParallaxRef.current = { x: newX, y: newY };

      // Direct DOM updates - no React re-renders
      // Filter to non-hidden layers to match ref indices
      const visibleLayers = cloudLayersRef.current.filter(l => !l.hidden);
      cloudRefs.current.forEach((el, i) => {
        if (el && visibleLayers[i]) {
          const cloud = visibleLayers[i];
          const m = cloud.parallaxMultiplier ?? 0;
          const translateX = newX * m;
          const translateY = newY * m * 0.3;
          const flip = cloud.flip ? 'scaleX(-1)' : '';
          const rotate = cloud.rotate ? `rotate(${cloud.rotate}deg)` : '';
          el.style.transform = `translate(${translateX}px, ${translateY}px) ${flip} ${rotate}`.trim();
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [mounted]);

  // Volumetric cloud floor - layered for depth
  const cloudLayers: CloudLayer[] = [
    // === LAYER 1: BACK BASE (deepest, most blur) ===
    {
      src: '/images/clouds/horizontal.webp',
      alt: 'Bottom floor back',
      position: 'left',
      offset: { x: '-10%', y: '-180%' },
      mobileOffset: { x: '-15%', y: '-60%' },
      size: '130vw',
      mobileSize: '180vw',
      rotate: 4,
      opacity: 1,
      blur: 2,
    },

    // === LAYER 2: MID-BACK (fills gaps, adds volume) ===
    {
      src: '/images/clouds/bunched.webp',
      alt: 'Left back pillow',
      position: 'left',
      offset: { x: '-35%', y: '-120%' },
      mobileOffset: { x: '-30%', y: '-45%' },
      size: '55vw',
      mobileSize: '70vw',
      opacity: 0.5,
      blur: 3,
      parallaxMultiplier: 0.15,
      zIndex: 11,
    },
    {
      src: '/images/clouds/bunched.webp',
      alt: 'Right back pillow',
      position: 'right',
      offset: { x: '-40%', y: '-130%' },
      mobileOffset: { x: '-35%', y: '-50%' },
      size: '50vw',
      mobileSize: '65vw',
      opacity: 0.45,
      blur: 3,
      parallaxMultiplier: 0.15,
      zIndex: 11,
      flip: true,
    },
    {
      src: '/images/clouds/horizontal-2.webp',
      alt: 'Back fill horizontal',
      position: 'left',
      offset: { x: '20%', y: '-150%' },
      mobileOffset: { x: '20%', y: '-150%' },
      size: '90vw',
      mobileSize: '90vw',
      opacity: 0.4,
      blur: 2,
      parallaxMultiplier: 0.2,
      zIndex: 12,
      flip: true,
      hidden: true,
    },

    // === LAYER 3: MID (building volume at corners) ===
    {
      src: '/images/clouds/vertical.webp',
      alt: 'Left mid stack',
      position: 'left',
      offset: { x: '-25%', y: '-80%' },
      mobileOffset: { x: '-20%', y: '-30%' },
      size: '45vw',
      mobileSize: '55vw',
      opacity: 0.6,
      blur: 1.5,
      parallaxMultiplier: 0.3,
      zIndex: 15,
    },
    {
      src: '/images/clouds/bunched.webp',
      alt: 'Left mid cluster',
      position: 'left',
      offset: { x: '-18%', y: '-60%' },
      mobileOffset: { x: '-15%', y: '-20%' },
      size: '40vw',
      mobileSize: '50vw',
      opacity: 0.55,
      blur: 1,
      parallaxMultiplier: 0.35,
      zIndex: 16,
      rotate: -3,
    },
    {
      src: '/images/clouds/vertical.webp',
      alt: 'Right mid stack',
      position: 'right',
      offset: { x: '-28%', y: '-90%' },
      mobileOffset: { x: '-22%', y: '-35%' },
      size: '42vw',
      mobileSize: '52vw',
      opacity: 0.55,
      blur: 1.5,
      parallaxMultiplier: 0.3,
      zIndex: 15,
      flip: true,
    },
    {
      src: '/images/clouds/bunched.webp',
      alt: 'Right mid cluster',
      position: 'right',
      offset: { x: '-20%', y: '-55%' },
      mobileOffset: { x: '-15%', y: '-18%' },
      size: '38vw',
      mobileSize: '48vw',
      opacity: 0.5,
      blur: 1,
      parallaxMultiplier: 0.35,
      zIndex: 16,
      rotate: 5,
      flip: true,
    },
    {
      src: '/images/clouds/horizontal.webp',
      alt: 'Center mid fill',
      position: 'left',
      offset: { x: '35%', y: '-50%' },
      mobileOffset: { x: '25%', y: '-15%' },
      size: '50vw',
      mobileSize: '70vw',
      opacity: 0.5,
      blur: 1,
      parallaxMultiplier: 0.25,
      zIndex: 14,
      rotate: -2,
    },

    // === LAYER 4: FRONT (closest, sharpest, most parallax) ===
    {
      src: '/images/clouds/bunched.webp',
      alt: 'Left front wisp',
      position: 'left',
      offset: { x: '-8%', y: '-25%' },
      mobileOffset: { x: '-5%', y: '-5%' },
      size: '32vw',
      mobileSize: '42vw',
      opacity: 0.4,
      blur: 0,
      parallaxMultiplier: 0.6,
      zIndex: 20,
      rotate: 8,
    },
    {
      src: '/images/clouds/bunched.webp',
      alt: 'Right front wisp',
      position: 'right',
      offset: { x: '-12%', y: '-30%' },
      mobileOffset: { x: '-8%', y: '-8%' },
      size: '28vw',
      mobileSize: '38vw',
      opacity: 0.35,
      blur: 0,
      parallaxMultiplier: 0.55,
      zIndex: 20,
      flip: true,
      rotate: -5,
    },
    {
      src: '/images/clouds/vertical.webp',
      alt: 'Left edge accent',
      position: 'left',
      offset: { x: '-15%', y: '-35%' },
      mobileOffset: { x: '-10%', y: '-10%' },
      size: '25vw',
      mobileSize: '35vw',
      opacity: 0.3,
      blur: 0,
      parallaxMultiplier: 0.7,
      zIndex: 22,
      rotate: 12,
    },
    {
      src: '/images/clouds/vertical.webp',
      alt: 'Right edge accent',
      position: 'right',
      offset: { x: '-18%', y: '-40%' },
      mobileOffset: { x: '-12%', y: '-12%' },
      size: '22vw',
      mobileSize: '32vw',
      opacity: 0.25,
      blur: 0,
      parallaxMultiplier: 0.65,
      zIndex: 22,
      flip: true,
      rotate: -8,
    },
  ];

  // Sync cloudLayers to ref for animation loop access
  cloudLayersRef.current = cloudLayers;

  if (!mounted) return null;

  const renderCloudImage = (cloud: CloudLayer, index: number) => (
    <Image
      src={cloud.src}
      alt={cloud.alt}
      width={1200}
      height={800}
      className="w-full h-auto select-none"
      style={{ filter: 'grayscale(100%) brightness(1.3)' }}
      draggable={false}
      priority={index < 3}
    />
  );

  // Initial transform with flip/rotate (parallax translate added by animation loop)
  const getInitialTransform = (cloud: CloudLayer) => {
    return `${cloud.flip ? 'scaleX(-1)' : ''} ${cloud.rotate ? `rotate(${cloud.rotate}deg)` : ''}`.trim();
  };

  // Track non-hidden cloud index for refs
  let refIndex = 0;

  return (
    <div
      className="fixed inset-x-0 bottom-0 h-[35vh] pointer-events-none overflow-visible"
      style={{ zIndex: 25 }}
      aria-hidden="true"
    >
      {cloudLayers.map((cloud, index) => {
        if (cloud.hidden) return null;

        const currentRefIndex = refIndex++;
        const initialTransform = getInitialTransform(cloud);

        // Desktop styles (no transform - handled by animation loop via ref)
        const desktopStyle: React.CSSProperties = {
          position: 'absolute',
          bottom: cloud.offset.y,
          [cloud.position]: cloud.offset.x,
          width: cloud.size,
          zIndex: cloud.zIndex,
          opacity: cloud.opacity,
          transform: initialTransform,
          filter: cloud.blur ? `blur(${cloud.blur}px)` : undefined,
        };

        // Mobile styles
        const mobileStyle: React.CSSProperties = {
          position: 'absolute',
          bottom: cloud.mobileOffset.y,
          [cloud.position]: cloud.mobileOffset.x,
          width: cloud.mobileSize,
          zIndex: cloud.zIndex,
          opacity: cloud.opacity,
          transform: initialTransform,
          filter: cloud.blur ? `blur(${cloud.blur}px)` : undefined,
        };

        return (
          <div key={index}>
            {/* Mobile version - visible below md breakpoint */}
            {!cloud.mobileHidden && (
              <div className="md:hidden" style={mobileStyle}>
                {renderCloudImage(cloud, index)}
              </div>
            )}
            {/* Desktop version - visible at md breakpoint and above */}
            <div
              ref={el => { cloudRefs.current[currentRefIndex] = el; }}
              className="hidden md:block"
              style={desktopStyle}
            >
              {renderCloudImage(cloud, index)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

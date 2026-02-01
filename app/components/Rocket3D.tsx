"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Clone, Center } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { signalReady } from "./LoadingScreen";
import { useScrollProgress, updateSection2Progress } from "@/app/lib/scrollProgress";

gsap.registerPlugin(ScrollTrigger);

interface RocketConfig {
  scale: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  arcHeight: number;
  bounceAmplitude: number;
  bounceSpeed: number;
  wobbleSpeed: number;
  rotationOffset: number;
  flameSize: number;
  flameGlow: number;
  boosterOffset3D: number;
  positionSmoothing: number;
  rotationSmoothing: number;
}

const DEFAULT_CONFIG: RocketConfig = {
  scale: 0.075,
  startX: 5.6,
  startY: 1.1,
  endX: -6.9,
  endY: -8.3,
  arcHeight: 1.6,
  bounceAmplitude: 0.13,
  bounceSpeed: 0.25,
  wobbleSpeed: 0.25,
  rotationOffset: 0,
  flameSize: 35,
  flameGlow: 40,
  boosterOffset3D: 0.75,
  // Smoothing factors (0-1, lower = smoother but more lag)
  positionSmoothing: 0.05,
  rotationSmoothing: 0.1,
};

interface ScreenPosition {
  x: number;
  y: number;
  rotation: number;
  visible: boolean;
}

interface TrailPoint {
  id: number;
  x: number;
  y: number;
  opacity: number;
  size: number;
}

function RocketModel({
  scrollProgress,
  section2ProgressRef,
  onScreenPositionUpdate,
  onReady,
  config,
}: {
  scrollProgress: React.MutableRefObject<number>;
  section2ProgressRef: React.MutableRefObject<number>;
  onScreenPositionUpdate: (pos: ScreenPosition) => void;
  onReady: () => void;
  config: RocketConfig;
}) {
  const { scene } = useGLTF("/assets/rocket.glb");
  const rocketRef = useRef<THREE.Group>(null);
  const idleTimeRef = useRef(0);
  const boosterVectorRef = useRef(new THREE.Vector3());
  const hasInitialized = useRef(false);
  const { camera, size } = useThree();

  // Smoothed values for interpolation
  const smoothedX = useRef(config.startX);
  const smoothedY = useRef(config.startY);
  const smoothedRotation = useRef(0);
  const smoothedScale = useRef(config.scale);

  useFrame((_, delta) => {
    if (!rocketRef.current) return;

    // Signal ready after first frame positions the rocket correctly
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      onReady();
    }

    idleTimeRef.current += delta;
    const t = idleTimeRef.current;
    const progress = scrollProgress.current;

    // Frame-rate independent smoothing factor
    const posFactor = 1 - Math.pow(1 - config.positionSmoothing, delta * 60);
    const rotFactor = 1 - Math.pow(1 - config.rotationSmoothing, delta * 60);

    // Parabolic arc
    const arcOffset = Math.sin(progress * Math.PI) * config.arcHeight;

    // Target position
    const targetX = THREE.MathUtils.lerp(config.startX, config.endX, progress);
    const targetY = THREE.MathUtils.lerp(config.startY, config.endY, progress) + arcOffset;

    // Idle bounce (reduced when scrolling)
    const idleFactor = 1 - progress * 0.8;
    const idleBounce = Math.sin(t * config.bounceSpeed) * config.bounceAmplitude * idleFactor;

    // Smooth position interpolation
    smoothedX.current = THREE.MathUtils.lerp(smoothedX.current, targetX, posFactor);
    smoothedY.current = THREE.MathUtils.lerp(smoothedY.current, targetY + idleBounce, posFactor);

    rocketRef.current.position.set(smoothedX.current, smoothedY.current, 0);

    // Rotation calculation
    const dx = config.endX - config.startX;
    const dy = (config.endY - config.startY) + Math.cos(progress * Math.PI) * Math.PI * config.arcHeight;
    const travelAngle = Math.atan2(dy, dx);
    const noseAngle = travelAngle - Math.PI / 2 + config.rotationOffset;

    // Idle wobble (reduced amplitude)
    const idleWobbleX = Math.sin(t * config.wobbleSpeed * 1.3) * 0.02 * idleFactor;
    const idleWobbleZ = Math.cos(t * config.wobbleSpeed) * 0.015 * idleFactor;

    const targetRotation = noseAngle + idleWobbleZ;

    // Smooth rotation interpolation
    smoothedRotation.current = THREE.MathUtils.lerp(smoothedRotation.current, targetRotation, rotFactor);

    rocketRef.current.rotation.set(idleWobbleX, 0, smoothedRotation.current);

    // Scale with smoothing
    const targetScale = config.scale + Math.sin(progress * Math.PI) * 0.005;
    smoothedScale.current = THREE.MathUtils.lerp(smoothedScale.current, targetScale, posFactor);
    rocketRef.current.scale.setScalar(smoothedScale.current);

    // Toggle visibility based on section2 progress - hide when section2 is complete
    const isVisible = section2ProgressRef.current < 1.0;
    rocketRef.current.visible = isVisible;

    // When invisible, notify with visible:false to hide flame/shadow, then skip further updates
    if (!isVisible) {
      onScreenPositionUpdate({ x: 0, y: 0, rotation: 0, visible: false });
      return;
    }

    // Calculate booster position in 3D space using smoothed values
    const boosterDirX = Math.sin(smoothedRotation.current);
    const boosterDirY = -Math.cos(smoothedRotation.current);
    const scaledBoosterOffset = config.boosterOffset3D * smoothedScale.current * 40;

    const boosterX = smoothedX.current + boosterDirX * scaledBoosterOffset;
    const boosterY = smoothedY.current + boosterDirY * scaledBoosterOffset;

    // Project booster 3D position to screen coordinates (reuse vector)
    boosterVectorRef.current.set(boosterX, boosterY, 0);
    boosterVectorRef.current.project(camera);

    onScreenPositionUpdate({
      x: (boosterVectorRef.current.x * 0.5 + 0.5) * size.width,
      y: (-boosterVectorRef.current.y * 0.5 + 0.5) * size.height,
      rotation: smoothedRotation.current,
      visible: boosterVectorRef.current.z < 1,
    });
  });

  return (
    <group ref={rocketRef} position={[config.startX, config.startY, 0]} scale={config.scale}>
      <Center>
        <Clone object={scene} />
      </Center>
    </group>
  );
}

function Scene({
  scrollProgress,
  section2ProgressRef,
  onScreenPositionUpdate,
  onReady,
  config,
}: {
  scrollProgress: React.MutableRefObject<number>;
  section2ProgressRef: React.MutableRefObject<number>;
  onScreenPositionUpdate: (pos: ScreenPosition) => void;
  onReady: () => void;
  config: RocketConfig;
}) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[0, -3, 2]} intensity={0.5} color="#e8f0ff" />
      <RocketModel
        scrollProgress={scrollProgress}
        section2ProgressRef={section2ProgressRef}
        onScreenPositionUpdate={onScreenPositionUpdate}
        onReady={onReady}
        config={config}
      />
    </>
  );
}

function RocketShadow({
  screenPos,
  scrollProgress,
}: {
  screenPos: ScreenPosition;
  scrollProgress: number;
}) {
  // Shadow only visible when rocket is over the moon (progress > 0.3)
  const shadowOpacity = Math.max(0, (scrollProgress - 0.25) * 2);
  if (shadowOpacity <= 0 || !screenPos.visible) return null;

  // Match rocket rotation exactly
  const rotation = -screenPos.rotation * 180 / Math.PI;

  // Viewport-relative scaling for mobile compatibility
  const viewportScale = typeof window !== "undefined"
    ? Math.min(window.innerWidth, window.innerHeight) / 1000
    : 1;

  // Large offset for depth illusion - light from top-right, shadow falls bottom-left
  const baseOffset = (120 + scrollProgress * 80) * viewportScale;
  const offsetX = baseOffset * 0.6;
  const offsetY = baseOffset * 0.8;

  // Scale shadow based on "altitude" over moon
  const shadowScale = (1.0 + scrollProgress * 0.3) * viewportScale;

  // Blur for soft shadow edge
  const shadowBlur = (8 + scrollProgress * 6) * viewportScale;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: screenPos.x + offsetX,
        top: screenPos.y + offsetY,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${shadowScale})`,
        opacity: shadowOpacity,
        filter: `blur(${shadowBlur}px)`,
      }}
    >
      {/* Main rocket body */}
      <div
        className="absolute"
        style={{
          width: 10 * viewportScale,
          height: 200 * viewportScale,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(0, 0, 0, 1)",
          borderRadius: "40% 40% 20% 20% / 4% 4% 2% 2%",
        }}
      />

      {/* Nose cone */}
      <div
        className="absolute"
        style={{
          width: 9 * viewportScale,
          height: 50 * viewportScale,
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% - ${120 * viewportScale}px))`,
          background: "rgba(0, 0, 0, 0.95)",
          borderRadius: "50% 50% 35% 35% / 85% 85% 15% 15%",
        }}
      />

      {/* Left booster */}
      <div
        className="absolute"
        style={{
          width: 6 * viewportScale,
          height: 150 * viewportScale,
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% - ${10 * viewportScale}px), calc(-50% + ${18 * viewportScale}px))`,
          background: "rgba(0, 0, 0, 0.9)",
          borderRadius: "40% 40% 20% 20% / 3% 3% 2% 2%",
        }}
      />

      {/* Right booster */}
      <div
        className="absolute"
        style={{
          width: 6 * viewportScale,
          height: 150 * viewportScale,
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${10 * viewportScale}px), calc(-50% + ${18 * viewportScale}px))`,
          background: "rgba(0, 0, 0, 0.9)",
          borderRadius: "40% 40% 20% 20% / 3% 3% 2% 2%",
        }}
      />

      {/* Left booster nose */}
      <div
        className="absolute"
        style={{
          width: 5 * viewportScale,
          height: 28 * viewportScale,
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% - ${10 * viewportScale}px), calc(-50% - ${62 * viewportScale}px))`,
          background: "rgba(0, 0, 0, 0.85)",
          borderRadius: "50% 50% 35% 35% / 75% 75% 25% 25%",
        }}
      />

      {/* Right booster nose */}
      <div
        className="absolute"
        style={{
          width: 5 * viewportScale,
          height: 28 * viewportScale,
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${10 * viewportScale}px), calc(-50% - ${62 * viewportScale}px))`,
          background: "rgba(0, 0, 0, 0.85)",
          borderRadius: "50% 50% 35% 35% / 75% 75% 25% 25%",
        }}
      />
    </div>
  );
}

function BoosterFlame({
  screenPos,
  scrollProgress,
  trails,
  config,
}: {
  screenPos: ScreenPosition;
  scrollProgress: number;
  trails: TrailPoint[];
  config: RocketConfig;
}) {
  if (!screenPos.visible) return null;

  const movementIntensity = Math.min(scrollProgress * 2, 1);
  const idleIntensity = 1 - movementIntensity;

  // Dynamic flame size
  const baseSize = config.flameSize * (1 + scrollProgress * 0.5);
  const flameHeight = baseSize * (0.6 + movementIntensity * 1.2);
  const flameWidth = baseSize * (0.4 + movementIntensity * 0.3);
  const glowSize = config.flameGlow * (0.7 + movementIntensity * 0.8);

  // Flame colors
  const coreColor = `rgba(255, ${220 + movementIntensity * 35}, ${150 + idleIntensity * 50}, 0.95)`;
  const midColor = `rgba(255, ${160 + movementIntensity * 40}, 60, 0.8)`;
  const outerColor = `rgba(255, ${100 + movementIntensity * 30}, 20, 0.5)`;

  const flameRotation = -screenPos.rotation * 180 / Math.PI;

  return (
    <>
      {/* Chemtrails */}
      {trails.map((trail) => (
        <div
          key={trail.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: trail.x,
            top: trail.y,
            width: trail.size,
            height: trail.size,
            opacity: trail.opacity,
            background: `radial-gradient(circle, rgba(255,180,100,0.5) 0%, rgba(255,120,50,0.2) 50%, transparent 80%)`,
            transform: "translate(-50%, -50%)",
            filter: `blur(${trail.size * 0.4}px)`,
          }}
        />
      ))}

      {/* Main flame container */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: screenPos.x,
          top: screenPos.y,
          transform: `translate(-50%, 0%) rotate(${flameRotation}deg)`,
          transformOrigin: "center top",
        }}
      >
        {/* Outer glow */}
        <div
          className="absolute rounded-full"
          style={{
            width: glowSize * 2.5,
            height: glowSize * 3,
            left: "50%",
            top: 0,
            transform: "translate(-50%, -20%)",
            background: `radial-gradient(ellipse 100% 120% at 50% 20%,
              rgba(255, 150, 50, ${0.4 + movementIntensity * 0.3}) 0%,
              rgba(255, 100, 0, ${0.2 + movementIntensity * 0.2}) 40%,
              transparent 70%)`,
            filter: `blur(${10 + movementIntensity * 10}px)`,
          }}
        />

        {/* Flame body */}
        <div
          className="absolute"
          style={{
            width: flameWidth,
            height: flameHeight,
            left: "50%",
            top: 0,
            transform: "translateX(-50%)",
            background: `linear-gradient(to bottom, ${coreColor} 0%, ${midColor} 30%, ${outerColor} 60%, transparent 100%)`,
            borderRadius: "40% 40% 50% 50% / 20% 20% 80% 80%",
            filter: `blur(${1 + movementIntensity * 2}px)`,
          }}
        />

        {/* Inner core */}
        <div
          className="absolute"
          style={{
            width: flameWidth * 0.4,
            height: flameHeight * 0.5,
            left: "50%",
            top: 0,
            transform: "translateX(-50%)",
            background: `linear-gradient(to bottom, rgba(255,255,240,1) 0%, rgba(255,240,180,0.9) 40%, rgba(255,200,100,0.6) 70%, transparent 100%)`,
            borderRadius: "40% 40% 50% 50% / 30% 30% 70% 70%",
            filter: `blur(${0.5 + movementIntensity * 0.5}px)`,
          }}
        />

        {/* Flickering particles - use fixed offsets for stable rendering */}
        {movementIntensity > 0.2 && (
          <>
            <div
              className="absolute animate-pulse"
              style={{
                width: 4 + movementIntensity * 4,
                height: 4 + movementIntensity * 4,
                left: `calc(50% + ${0.15 * flameWidth}px)`,
                top: flameHeight * 0.5,
                background: "rgba(255, 200, 100, 0.8)",
                borderRadius: "50%",
                filter: "blur(2px)",
              }}
            />
            <div
              className="absolute animate-pulse"
              style={{
                width: 3 + movementIntensity * 3,
                height: 3 + movementIntensity * 3,
                left: `calc(50% + ${-0.2 * flameWidth}px)`,
                top: flameHeight * 0.7,
                background: "rgba(255, 150, 50, 0.6)",
                borderRadius: "50%",
                filter: "blur(2px)",
                animationDelay: "0.1s",
              }}
            />
          </>
        )}
      </div>
    </>
  );
}

export default function Rocket3D() {
  const scrollProgressRef = useRef(0);
  const section2ProgressRef = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [screenPos, setScreenPos] = useState<ScreenPosition>({ x: 0, y: 0, rotation: 0, visible: false });
  const [trails, setTrails] = useState<TrailPoint[]>([]);
  const [isReady, setIsReady] = useState(false);
  const trailIdRef = useRef(0);
  const lastStateUpdateRef = useRef(0);
  const hasSignaledReady = useRef(false);

  const config = DEFAULT_CONFIG;
  const configRef = useRef(config);

  // Subscribe to section2 progress for visibility control
  const { section2 } = useScrollProgress();

  // Keep section2 ref in sync
  useEffect(() => {
    section2ProgressRef.current = section2;
  }, [section2]);

  const screenPosRef = useRef(screenPos);
  const scrollProgressValRef = useRef(scrollProgress);

  // Sync refs in effect to avoid updating refs during render
  useEffect(() => {
    screenPosRef.current = screenPos;
  }, [screenPos]);

  useEffect(() => {
    scrollProgressValRef.current = scrollProgress;
  }, [scrollProgress]);

  const handleReady = useCallback(() => {
    setIsReady(true);
    if (!hasSignaledReady.current) {
      hasSignaledReady.current = true;
      signalReady();
    }
  }, []);

  // Trail creation and fading with idle detection
  useEffect(() => {
    let lastTrailTime = 0;
    let lastProgress = scrollProgressValRef.current;
    let lastChangeTime = Date.now();
    let isScrollIdle = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const runInterval = () => {
      const progress = scrollProgressValRef.current;
      const pos = screenPosRef.current;
      const now = Date.now();

      // Detect if scroll progress has changed
      if (Math.abs(progress - lastProgress) > 0.001) {
        lastProgress = progress;
        lastChangeTime = now;
        isScrollIdle = false;
      } else if (!isScrollIdle && now - lastChangeTime > 500) {
        isScrollIdle = true;
      }

      setTrails((prev) => {
        // When idle and no trails left, skip processing entirely
        if (isScrollIdle && prev.length === 0) return prev;

        // Create new trail only if actively scrolling
        let newTrails = prev;
        if (!isScrollIdle && progress > 0.05 && pos.visible) {
          if (now - lastTrailTime > 40) {
            lastTrailTime = now;

            const currentConfig = configRef.current;
            const trailOffsetDist = currentConfig.flameSize * (-1 + progress);
            const exhaustAngle = -pos.rotation;
            const trailX = pos.x + Math.sin(exhaustAngle) * trailOffsetDist;
            const trailY = pos.y - Math.cos(exhaustAngle) * trailOffsetDist;

            newTrails = [
              ...prev.slice(-25),
              {
                id: trailIdRef.current++,
                x: trailX,
                y: trailY,
                opacity: 0.5 + progress * 0.3,
                size: currentConfig.flameSize * (0.3 + progress * 0.4),
              },
            ];
          }
        }

        // Fade trails - faster when idle to clear them quickly
        const fadeRate = isScrollIdle ? 0.08 : 0.015;
        const sizeMultiplier = isScrollIdle ? 0.92 : 0.97;

        return newTrails
          .map((trail) => ({
            ...trail,
            opacity: trail.opacity - fadeRate,
            size: trail.size * sizeMultiplier,
          }))
          .filter((trail) => trail.opacity > 0);
      });
    };

    intervalId = setInterval(runInterval, 25);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []); // Empty deps - uses refs for current values

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: "#moon-section",
      start: "top bottom",
      end: "top top-=30%",
      scrub: 1.8,
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;
        updateSection2Progress(self.progress);
        // Throttle React state updates to ~60fps to prevent lag from touchpad scroll events
        const now = performance.now();
        if (now - lastStateUpdateRef.current >= 16) {
          lastStateUpdateRef.current = now;
          setScrollProgress(self.progress);
        }
      },
      onRefresh: (self) => {
        // Sync progress immediately when trigger is refreshed (e.g., on remount)
        scrollProgressRef.current = self.progress;
        updateSection2Progress(self.progress);
        setScrollProgress(self.progress);
      },
    });

    // Immediately sync to current scroll position on mount
    scrollProgressRef.current = trigger.progress;
    updateSection2Progress(trigger.progress);
    setScrollProgress(trigger.progress);

    return () => trigger.kill();
  }, []);

  const handleScreenPositionUpdate = useCallback((pos: ScreenPosition) => {
    setScreenPos(pos);
  }, []);

  return (
    <>
      {/* Shadow layer - renders on moon surface */}
      <div
        className="fixed inset-0 z-[23] pointer-events-none overflow-hidden transition-opacity duration-500"
        style={{ opacity: isReady ? 1 : 0 }}
        aria-hidden="true"
      >
        <RocketShadow screenPos={screenPos} scrollProgress={scrollProgress} />
      </div>

      <div
        className="fixed inset-0 z-[25] pointer-events-none transition-opacity duration-500"
        style={{ opacity: isReady ? 1 : 0 }}
        aria-hidden="true"
      >
        <Canvas gl={{ antialias: true, alpha: true }} dpr={[1, 2]} camera={{ fov: 45, near: 0.1, far: 100 }} style={{ pointerEvents: "none" }}>
          <Scene
            scrollProgress={scrollProgressRef}
            section2ProgressRef={section2ProgressRef}
            onScreenPositionUpdate={handleScreenPositionUpdate}
            onReady={handleReady}
            config={config}
          />
        </Canvas>
      </div>

      <div
        className="fixed inset-0 z-[26] pointer-events-none overflow-hidden transition-opacity duration-500"
        style={{ opacity: isReady ? 1 : 0 }}
        aria-hidden="true"
      >
        <BoosterFlame screenPos={screenPos} scrollProgress={scrollProgress} trails={trails} config={config} />
      </div>
    </>
  );
}

useGLTF.preload("/assets/rocket.glb");

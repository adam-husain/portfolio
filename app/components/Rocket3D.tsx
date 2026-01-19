"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Clone, Center } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Animation constants
const CONFIG = {
  scale: 0.05,
  startX: 5.6,
  startY: -1,
  endX: -5.7,
  endY: -3.4,
  arcHeight: 2.1,
  bounceAmplitude: 0.22,
  bounceSpeed: 0.3,
  wobbleSpeed: 0.3,
  rotationOffset: 0,
  flameSize: 35,
  flameGlow: 40,
  boosterOffset3D: 0.75,
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
  onScreenPositionUpdate,
}: {
  scrollProgress: React.MutableRefObject<number>;
  onScreenPositionUpdate: (pos: ScreenPosition) => void;
}) {
  const { scene } = useGLTF("/assets/rocket.glb");
  const rocketRef = useRef<THREE.Group>(null);
  const idleTimeRef = useRef(0);
  const { camera, size } = useThree();

  useFrame((_, delta) => {
    if (!rocketRef.current) return;

    idleTimeRef.current += delta;
    const t = idleTimeRef.current;
    const progress = scrollProgress.current;

    // Parabolic arc
    const arcOffset = Math.sin(progress * Math.PI) * CONFIG.arcHeight;

    // Interpolate position
    const x = THREE.MathUtils.lerp(CONFIG.startX, CONFIG.endX, progress);
    const y = THREE.MathUtils.lerp(CONFIG.startY, CONFIG.endY, progress) + arcOffset;

    // Idle bounce (reduced when scrolling)
    const idleFactor = 1 - progress * 0.8;
    const idleBounce = Math.sin(t * CONFIG.bounceSpeed) * CONFIG.bounceAmplitude * idleFactor;

    const rocketX = x;
    const rocketY = y + idleBounce;

    rocketRef.current.position.set(rocketX, rocketY, 0);

    // Rotation calculation
    const dx = CONFIG.endX - CONFIG.startX;
    const dy = (CONFIG.endY - CONFIG.startY) + Math.cos(progress * Math.PI) * Math.PI * CONFIG.arcHeight;
    const travelAngle = Math.atan2(dy, dx);
    const noseAngle = travelAngle - Math.PI / 2 + CONFIG.rotationOffset;

    // Idle wobble
    const idleWobbleX = Math.sin(t * CONFIG.wobbleSpeed * 1.3) * 0.03 * idleFactor;
    const idleWobbleZ = Math.cos(t * CONFIG.wobbleSpeed) * 0.02 * idleFactor;

    const finalRotation = noseAngle + idleWobbleZ;

    rocketRef.current.rotation.set(idleWobbleX, 0, finalRotation);

    // Scale
    const currentScale = CONFIG.scale + Math.sin(progress * Math.PI) * 0.005;
    rocketRef.current.scale.setScalar(currentScale);

    // Calculate booster position in 3D space
    const boosterDirX = Math.sin(finalRotation);
    const boosterDirY = -Math.cos(finalRotation);
    const scaledBoosterOffset = CONFIG.boosterOffset3D * currentScale * 40;

    const boosterX = rocketX + boosterDirX * scaledBoosterOffset;
    const boosterY = rocketY + boosterDirY * scaledBoosterOffset;

    // Project booster 3D position to screen coordinates
    const boosterVector = new THREE.Vector3(boosterX, boosterY, 0);
    boosterVector.project(camera);

    onScreenPositionUpdate({
      x: (boosterVector.x * 0.5 + 0.5) * size.width,
      y: (-boosterVector.y * 0.5 + 0.5) * size.height,
      rotation: finalRotation,
      visible: boosterVector.z < 1,
    });
  });

  return (
    <group ref={rocketRef} position={[CONFIG.startX, CONFIG.startY, 0]} scale={CONFIG.scale}>
      <Center>
        <Clone object={scene} />
      </Center>
    </group>
  );
}

function Scene({
  scrollProgress,
  onScreenPositionUpdate,
}: {
  scrollProgress: React.MutableRefObject<number>;
  onScreenPositionUpdate: (pos: ScreenPosition) => void;
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
      <RocketModel scrollProgress={scrollProgress} onScreenPositionUpdate={onScreenPositionUpdate} />
    </>
  );
}

function BoosterFlame({
  screenPos,
  scrollProgress,
  trails,
}: {
  screenPos: ScreenPosition;
  scrollProgress: number;
  trails: TrailPoint[];
}) {
  if (!screenPos.visible) return null;

  const movementIntensity = Math.min(scrollProgress * 2, 1);
  const idleIntensity = 1 - movementIntensity;

  // Dynamic flame size
  const baseSize = CONFIG.flameSize * (1 + scrollProgress * 0.5);
  const flameHeight = baseSize * (0.6 + movementIntensity * 1.2);
  const flameWidth = baseSize * (0.4 + movementIntensity * 0.3);
  const glowSize = CONFIG.flameGlow * (0.7 + movementIntensity * 0.8);

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

        {/* Flickering particles */}
        {movementIntensity > 0.2 && (
          <>
            <div
              className="absolute animate-pulse"
              style={{
                width: 4 + movementIntensity * 4,
                height: 4 + movementIntensity * 4,
                left: `calc(50% + ${(Math.random() - 0.5) * flameWidth}px)`,
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
                left: `calc(50% + ${(Math.random() - 0.5) * flameWidth}px)`,
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [screenPos, setScreenPos] = useState<ScreenPosition>({ x: 0, y: 0, rotation: 0, visible: false });
  const [trails, setTrails] = useState<TrailPoint[]>([]);
  const lastTrailTime = useRef(0);
  const trailIdRef = useRef(0);

  // Trail creation - only when moving
  useEffect(() => {
    if (scrollProgress > 0.05 && screenPos.visible) {
      const now = Date.now();
      if (now - lastTrailTime.current > 40) {
        lastTrailTime.current = now;

        const trailOffsetDist = CONFIG.flameSize * (-1 + scrollProgress);
        const exhaustAngle = -screenPos.rotation;
        const trailX = screenPos.x + Math.sin(exhaustAngle) * trailOffsetDist;
        const trailY = screenPos.y - Math.cos(exhaustAngle) * trailOffsetDist;

        setTrails((prev) => [
          ...prev.slice(-25),
          {
            id: trailIdRef.current++,
            x: trailX,
            y: trailY,
            opacity: 0.5 + scrollProgress * 0.3,
            size: CONFIG.flameSize * (0.3 + scrollProgress * 0.4),
          },
        ]);
      }
    }
  }, [scrollProgress, screenPos]);

  // Trail fade - separate effect with stable interval
  const isIdle = scrollProgress < 0.05;
  useEffect(() => {
    const fadeRate = isIdle ? 0.08 : 0.015;
    const interval = setInterval(() => {
      setTrails((prev) =>
        prev
          .map((trail) => ({
            ...trail,
            opacity: trail.opacity - fadeRate,
            size: trail.size * (isIdle ? 0.92 : 0.97),
          }))
          .filter((trail) => trail.opacity > 0)
      );
    }, 25);

    return () => clearInterval(interval);
  }, [isIdle]);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: "#moon-section",
      start: "top bottom",
      end: "top top",
      scrub: true,
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;
        setScrollProgress(self.progress);
      },
    });

    return () => trigger.kill();
  }, []);

  const handleScreenPositionUpdate = useCallback((pos: ScreenPosition) => {
    setScreenPos(pos);
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-[25] pointer-events-none" aria-hidden="true">
        <Canvas gl={{ antialias: true, alpha: true }} dpr={[1, 2]} camera={{ fov: 45, near: 0.1, far: 100 }}>
          <Scene scrollProgress={scrollProgressRef} onScreenPositionUpdate={handleScreenPositionUpdate} />
        </Canvas>
      </div>

      <div className="fixed inset-0 z-[26] pointer-events-none overflow-hidden" aria-hidden="true">
        <BoosterFlame screenPos={screenPos} scrollProgress={scrollProgress} trails={trails} />
      </div>
    </>
  );
}

useGLTF.preload("/assets/rocket.glb");

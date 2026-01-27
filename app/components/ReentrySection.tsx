"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { Center } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { updateSection4Progress } from "@/app/lib/scrollProgress";
import ReentryDebugPanel, {
  type ReentryConfig,
  type AsteroidPath,
} from "@/app/components/debug/ReentryDebugPanel";

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// DEFAULT CONFIGURATION
// ============================================================
const DEFAULT_CONFIG: ReentryConfig = {
  // Section
  sectionHeight: "200vh",

  // Asteroids
  asteroidCount: 5,
  asteroidScaleRange: [0.15, 0.35],

  // Balloon (starts after asteroids finish ~0.5 progress)
  balloonScale: 0.8,
  balloonStartX: -8,
  balloonStartY: -6,
  balloonEndX: -4,
  balloonEndY: 0,
  balloonWobbleSpeed: 1.5,
  balloonWobbleAmount: 0.1,

  // Text (appears with balloon, after asteroids)
  textStart: 0.55,
  textEnd: 0.85,
};

// Asteroid trajectory data - both go from top-right to bottom-left (re-entry from space)
const DEFAULT_ASTEROID_PATHS: AsteroidPath[] = [
  // Asteroid 1: Large, leads the descent from top-right to bottom-left
  { startX: 6.3, startY: 6.5, endX: -4.2, endY: -7.5, delay: 0, scale: 0.8 },
  // Asteroid 2: Smaller, wider arc trajectory, follows asteroid 1
  { startX: 3.5, startY: 5.5, endX: -9.5, endY: -6, delay: 0.15, scale: 0.5 },
];

// ============================================================
// FLAME CONFIG
// ============================================================
const FLAME_CONFIG = {
  baseSize: 60,
  glowSize: 80,
};

// ============================================================
// ASTEROID COMPONENT (3D)
// ============================================================
const ASTEROID_MODELS = ["/assets/asteroid_1.glb", "/assets/asteroid_2.glb"];

function AsteroidModel({
  scrollProgress,
  path,
  index,
  onPositionUpdate,
}: {
  scrollProgress: React.MutableRefObject<number>;
  path: AsteroidPath;
  index: number;
  onPositionUpdate: (index: number, x: number, y: number, visible: boolean, rotation: number, scale: number) => void;
}) {
  const modelPath = ASTEROID_MODELS[index % ASTEROID_MODELS.length];
  const gltf = useLoader(GLTFLoader, modelPath);
  const asteroidRef = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  const positionRef = useRef(new THREE.Vector3());
  // Rotation multipliers - how many full rotations per scroll through section
  const rotationMultiplier = useRef({
    x: 2 + Math.random() * 2,
    y: 1.5 + Math.random() * 1.5,
    z: 1 + Math.random() * 1,
  });
  // Random offset so asteroids start at different angles
  const rotationOffset = useRef({
    x: Math.random() * Math.PI * 2,
    y: Math.random() * Math.PI * 2,
    z: Math.random() * Math.PI * 2,
  });
  // Smoothed rotation values
  const smoothedRotation = useRef({ x: 0, y: 0, z: 0 });
  const ROTATION_SMOOTHING = 0.08;

  useFrame((_, delta) => {
    if (!asteroidRef.current) return;

    const rawProgress = scrollProgress.current;
    // Apply delay to stagger asteroid entries
    const delayedProgress = Math.max(0, (rawProgress - path.delay) / (1 - path.delay));

    // Easing for smooth movement
    const eased = 1 - Math.pow(1 - Math.min(1, delayedProgress), 2);

    // Simple linear interpolation from start to end
    const x = THREE.MathUtils.lerp(path.startX, path.endX, eased);
    const y = THREE.MathUtils.lerp(path.startY, path.endY, eased);

    asteroidRef.current.position.set(x, y, 0);
    asteroidRef.current.scale.setScalar(path.scale);

    // Scroll-driven tumbling rotation with smoothing
    const rm = rotationMultiplier.current;
    const ro = rotationOffset.current;
    const targetRotX = ro.x + eased * Math.PI * 2 * rm.x;
    const targetRotY = ro.y + eased * Math.PI * 2 * rm.y;
    const targetRotZ = ro.z + eased * Math.PI * 2 * rm.z;

    // Smooth interpolation towards target rotation
    const smoothFactor = 1 - Math.pow(1 - ROTATION_SMOOTHING, delta * 60);
    smoothedRotation.current.x = THREE.MathUtils.lerp(smoothedRotation.current.x, targetRotX, smoothFactor);
    smoothedRotation.current.y = THREE.MathUtils.lerp(smoothedRotation.current.y, targetRotY, smoothFactor);
    smoothedRotation.current.z = THREE.MathUtils.lerp(smoothedRotation.current.z, targetRotZ, smoothFactor);

    asteroidRef.current.rotation.set(
      smoothedRotation.current.x,
      smoothedRotation.current.y,
      smoothedRotation.current.z
    );

    // Project to screen coordinates for flame effect
    positionRef.current.set(x, y, 0);
    positionRef.current.project(camera);

    const screenX = (positionRef.current.x * 0.5 + 0.5) * size.width;
    const screenY = (-positionRef.current.y * 0.5 + 0.5) * size.height;

    // Calculate movement direction for flame angle
    const angle = Math.atan2(path.endY - path.startY, path.endX - path.startX);

    const visible = delayedProgress > 0 && delayedProgress < 1;
    onPositionUpdate(index, screenX, screenY, visible, angle, path.scale);
  });

  // Clone and pick one asteroid mesh
  const asteroidMesh = useMemo(() => {
    const scene = gltf.scene.clone();
    let targetMesh: THREE.Object3D | null = null;
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && !targetMesh) {
        targetMesh = child;
      }
    });
    return targetMesh || scene;
  }, [gltf.scene]);

  return (
    <group ref={asteroidRef}>
      <Center>
        <primitive object={asteroidMesh} />
      </Center>
    </group>
  );
}

// ============================================================
// BALLOON COMPONENT (3D)
// ============================================================
function BalloonModel({
  scrollProgress,
  config,
}: {
  scrollProgress: React.MutableRefObject<number>;
  config: ReentryConfig;
}) {
  const gltf = useLoader(GLTFLoader, "/assets/balloon.glb");
  const balloonRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const smoothedValues = useRef({
    x: config.balloonStartX,
    y: config.balloonStartY,
    rotZ: 0,
  });

  useFrame((_, delta) => {
    if (!balloonRef.current) return;

    timeRef.current += delta;
    const progress = scrollProgress.current;

    // Balloon appears after asteroids finish animating (starts at 0.5 progress)
    const balloonProgress = Math.max(0, (progress - 0.5) / 0.5);
    const eased = 1 - Math.pow(1 - Math.min(1, balloonProgress), 3);

    // Target position
    const targetX = THREE.MathUtils.lerp(config.balloonStartX, config.balloonEndX, eased);
    const targetY = THREE.MathUtils.lerp(config.balloonStartY, config.balloonEndY, eased);

    // Wobble effect
    const wobbleX = Math.sin(timeRef.current * config.balloonWobbleSpeed) * config.balloonWobbleAmount;
    const wobbleZ = Math.sin(timeRef.current * config.balloonWobbleSpeed * 0.7) * 0.05;

    // Smooth interpolation
    const smoothFactor = 1 - Math.pow(0.9, delta * 60);
    smoothedValues.current.x = THREE.MathUtils.lerp(smoothedValues.current.x, targetX + wobbleX, smoothFactor);
    smoothedValues.current.y = THREE.MathUtils.lerp(smoothedValues.current.y, targetY, smoothFactor);
    smoothedValues.current.rotZ = THREE.MathUtils.lerp(smoothedValues.current.rotZ, wobbleZ, smoothFactor);

    balloonRef.current.position.set(smoothedValues.current.x, smoothedValues.current.y, 0);
    balloonRef.current.rotation.set(0, timeRef.current * 0.2, smoothedValues.current.rotZ);
    balloonRef.current.scale.setScalar(config.balloonScale);

    // Visibility
    balloonRef.current.visible = balloonProgress > 0;
  });

  return (
    <group ref={balloonRef} visible={false}>
      <Center>
        <primitive object={gltf.scene.clone()} />
      </Center>
    </group>
  );
}

// ============================================================
// DEBUG POSITION INDICATORS
// ============================================================
const DEBUG_COLORS = {
  start: "#22c55e", // green
  end: "#ef4444",   // red
};

function DebugPositionIndicator({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.25, 0.3, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function DebugAsteroidPath({ path }: { path: AsteroidPath }) {
  const lineObj = useMemo(() => {
    const points = [
      new THREE.Vector3(path.startX, path.startY, 0),
      new THREE.Vector3(path.endX, path.endY, 0),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.4 });
    return new THREE.Line(geometry, material);
  }, [path.startX, path.startY, path.endX, path.endY]);

  return (
    <group>
      <primitive object={lineObj} />
      <DebugPositionIndicator position={[path.startX, path.startY, 0]} color={DEBUG_COLORS.start} />
      <DebugPositionIndicator position={[path.endX, path.endY, 0]} color={DEBUG_COLORS.end} />
    </group>
  );
}

function DebugBalloonPath({ config }: { config: ReentryConfig }) {
  const lineObj = useMemo(() => {
    const points = [
      new THREE.Vector3(config.balloonStartX, config.balloonStartY, 0),
      new THREE.Vector3(config.balloonEndX, config.balloonEndY, 0),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: "#fca311", transparent: true, opacity: 0.6 });
    return new THREE.Line(geometry, material);
  }, [config.balloonStartX, config.balloonStartY, config.balloonEndX, config.balloonEndY]);

  return (
    <group>
      <primitive object={lineObj} />
      <DebugPositionIndicator position={[config.balloonStartX, config.balloonStartY, 0]} color={DEBUG_COLORS.start} />
      <DebugPositionIndicator position={[config.balloonEndX, config.balloonEndY, 0]} color={DEBUG_COLORS.end} />
    </group>
  );
}

// ============================================================
// 3D SCENE
// ============================================================
function Scene({
  scrollProgress,
  onAsteroidPositionUpdate,
  asteroidPaths,
  config,
  expandedAsteroidIndices,
  balloonExpanded,
}: {
  scrollProgress: React.MutableRefObject<number>;
  onAsteroidPositionUpdate: (index: number, x: number, y: number, visible: boolean, rotation: number, scale: number) => void;
  asteroidPaths: AsteroidPath[];
  config: ReentryConfig;
  expandedAsteroidIndices: number[];
  balloonExpanded: boolean;
}) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-3, -2, 3]} intensity={0.3} color="#ff6b35" />
      <pointLight position={[0, 0, 5]} intensity={0.5} color="#ffd166" />

      {/* Asteroids */}
      {asteroidPaths.map((path, index) => (
        <AsteroidModel
          key={index}
          scrollProgress={scrollProgress}
          path={path}
          index={index}
          onPositionUpdate={onAsteroidPositionUpdate}
        />
      ))}

      {/* Balloon */}
      <BalloonModel scrollProgress={scrollProgress} config={config} />

      {/* Debug indicators for expanded asteroids */}
      {expandedAsteroidIndices.map((index) => (
        <DebugAsteroidPath key={`debug-${index}`} path={asteroidPaths[index]} />
      ))}

      {/* Debug indicators for balloon when expanded */}
      {balloonExpanded && <DebugBalloonPath config={config} />}
    </>
  );
}

// ============================================================
// FLAME EFFECTS - Intense in-place burn (like rocket booster)
// ============================================================
function AsteroidFlame({
  x,
  y,
  rotation,
  intensity,
  scale,
}: {
  x: number;
  y: number;
  rotation: number;
  intensity: number;
  scale: number;
}) {
  const flameRotation = (-rotation * 180) / Math.PI + 90;

  // Scale flame relative to model scale (0.2 is the reference scale)
  const scaleMultiplier = scale / 0.2;

  // Dynamic flame sizing based on intensity and model scale
  const baseSize = FLAME_CONFIG.baseSize * (0.8 + intensity * 0.6) * scaleMultiplier;
  const flameHeight = baseSize * (1.2 + intensity * 0.8);
  const flameWidth = baseSize * (0.5 + intensity * 0.2);
  const glowSize = FLAME_CONFIG.glowSize * (0.8 + intensity * 0.6) * scaleMultiplier;

  // Flame colors - more intense = brighter/whiter core
  const coreColor = `rgba(255, ${240 - intensity * 20}, ${200 - intensity * 50}, 0.95)`;
  const midColor = `rgba(255, ${180 - intensity * 30}, 80, 0.85)`;
  const outerColor = `rgba(255, ${120 - intensity * 20}, 30, 0.6)`;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${flameRotation}deg)`,
        transformOrigin: "center center",
      }}
    >
      {/* Outer glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: glowSize * 2,
          height: glowSize * 2.5,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -30%)",
          background: `radial-gradient(ellipse 100% 120% at 50% 30%,
            rgba(255, 180, 80, ${0.5 * intensity}) 0%,
            rgba(255, 120, 40, ${0.3 * intensity}) 40%,
            transparent 70%)`,
          filter: `blur(${12 + intensity * 8}px)`,
        }}
      />

      {/* Main flame body */}
      <div
        className="absolute"
        style={{
          width: flameWidth,
          height: flameHeight,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -20%)",
          background: `linear-gradient(to bottom,
            ${coreColor} 0%,
            ${midColor} 35%,
            ${outerColor} 65%,
            transparent 100%)`,
          borderRadius: "40% 40% 50% 50% / 25% 25% 75% 75%",
          filter: `blur(${2 + intensity}px)`,
        }}
      />

      {/* Bright inner core */}
      <div
        className="absolute"
        style={{
          width: flameWidth * 0.4,
          height: flameHeight * 0.45,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -15%)",
          background: `linear-gradient(to bottom,
            rgba(255,255,250,1) 0%,
            rgba(255,245,200,0.95) 35%,
            rgba(255,220,150,0.7) 65%,
            transparent 100%)`,
          borderRadius: "45% 45% 50% 50% / 30% 30% 70% 70%",
          filter: `blur(${1 + intensity * 0.5}px)`,
        }}
      />

      {/* Secondary flame wisps */}
      <div
        className="absolute"
        style={{
          width: flameWidth * 0.7,
          height: flameHeight * 0.7,
          left: "50%",
          top: "50%",
          transform: "translate(-60%, -10%)",
          background: `linear-gradient(to bottom,
            rgba(255,200,100,0.8) 0%,
            rgba(255,150,50,0.5) 50%,
            transparent 100%)`,
          borderRadius: "50% 40% 50% 50% / 30% 25% 75% 70%",
          filter: `blur(${3 + intensity}px)`,
        }}
      />

      <div
        className="absolute"
        style={{
          width: flameWidth * 0.6,
          height: flameHeight * 0.65,
          left: "50%",
          top: "50%",
          transform: "translate(-40%, -5%)",
          background: `linear-gradient(to bottom,
            rgba(255,180,80,0.7) 0%,
            rgba(255,130,40,0.4) 50%,
            transparent 100%)`,
          borderRadius: "40% 50% 50% 50% / 25% 30% 70% 75%",
          filter: `blur(${3 + intensity}px)`,
        }}
      />

      {/* Hot spots / flickering embers */}
      {intensity > 0.3 && (
        <>
          <div
            className="absolute animate-pulse"
            style={{
              width: 6 + intensity * 4,
              height: 6 + intensity * 4,
              left: "50%",
              top: "50%",
              transform: `translate(${-50 + (Math.random() - 0.5) * 30}%, ${30 + intensity * 20}%)`,
              background: "rgba(255, 220, 150, 0.9)",
              borderRadius: "50%",
              filter: "blur(2px)",
              boxShadow: "0 0 8px rgba(255, 200, 100, 0.8)",
            }}
          />
          <div
            className="absolute animate-pulse"
            style={{
              width: 4 + intensity * 3,
              height: 4 + intensity * 3,
              left: "50%",
              top: "50%",
              transform: `translate(${-50 + (Math.random() - 0.5) * 40}%, ${50 + intensity * 25}%)`,
              background: "rgba(255, 180, 100, 0.7)",
              borderRadius: "50%",
              filter: "blur(2px)",
              animationDelay: "0.15s",
            }}
          />
        </>
      )}
    </div>
  );
}

function FlameEffects({
  asteroidPositions,
  scrollProgress,
}: {
  asteroidPositions: { x: number; y: number; visible: boolean; rotation: number; scale: number }[];
  scrollProgress: number;
}) {
  // Check if any asteroid is visible
  const hasVisibleAsteroids = asteroidPositions.some((pos) => pos.visible);
  const isInActiveRange = scrollProgress >= 0.05 && scrollProgress <= 0.85;
  const shouldShowEffects = hasVisibleAsteroids && isInActiveRange;

  if (!shouldShowEffects) {
    return null;
  }

  // Intensity peaks in the middle of the scroll
  const intensity = Math.sin(scrollProgress * Math.PI);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {asteroidPositions.map((pos, idx) => {
        if (!pos.visible) return null;

        return (
          <AsteroidFlame
            key={idx}
            x={pos.x}
            y={pos.y}
            rotation={pos.rotation}
            intensity={intensity}
            scale={pos.scale}
          />
        );
      })}
    </div>
  );
}

// ============================================================
// HEAT DISTORTION OVERLAY
// ============================================================
function HeatDistortion({ scrollProgress }: { scrollProgress: number }) {
  const intensity = Math.sin(scrollProgress * Math.PI) * 0.3;

  if (intensity < 0.05) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse 80% 60% at 50% 30%,
          rgba(255, 100, 0, ${intensity * 0.15}) 0%,
          rgba(255, 50, 0, ${intensity * 0.05}) 50%,
          transparent 100%)`,
        mixBlendMode: "screen",
      }}
    />
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function ReentrySection() {
  const scrollProgressRef = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [config, setConfig] = useState<ReentryConfig>(DEFAULT_CONFIG);
  const [asteroidPaths, setAsteroidPaths] = useState<AsteroidPath[]>(DEFAULT_ASTEROID_PATHS);
  const [asteroidPositions, setAsteroidPositions] = useState<{ x: number; y: number; visible: boolean; rotation: number; scale: number }[]>(
    DEFAULT_ASTEROID_PATHS.map((p) => ({ x: 0, y: 0, visible: false, rotation: 0, scale: p.scale }))
  );
  const [expandedAsteroidIndices, setExpandedAsteroidIndices] = useState<number[]>([]);
  const [balloonExpanded, setBalloonExpanded] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const configRef = useRef(config);

  // Keep configRef in sync
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Handle asteroid position updates from 3D scene
  const handleAsteroidPositionUpdate = useCallback((index: number, x: number, y: number, visible: boolean, rotation: number, scale: number) => {
    setAsteroidPositions((prev) => {
      const newPositions = [...prev];
      newPositions[index] = { x, y, visible, rotation, scale };
      return newPositions;
    });
  }, []);

  // Debug panel handlers
  const handleConfigChange = useCallback((key: keyof ReentryConfig, value: number | string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleAsteroidPathChange = useCallback((index: number, key: keyof AsteroidPath, value: number) => {
    setAsteroidPaths((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  }, []);

  const handleReset = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    setAsteroidPaths(DEFAULT_ASTEROID_PATHS);
  }, []);

  const handleBalloonExpandedChange = useCallback((expanded: boolean) => {
    setBalloonExpanded(expanded);
  }, []);

  const handleExpandedAsteroidsChange = useCallback((indices: number[]) => {
    setExpandedAsteroidIndices(indices);
  }, []);

  // ScrollTrigger setup
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: "#reentry-section",
      start: "top bottom",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;
        setScrollProgress(self.progress);
        updateSection4Progress(self.progress);

        // Text animation using ref for current config values
        const currentConfig = configRef.current;
        const textProgress = Math.max(
          0,
          Math.min(1, (self.progress - currentConfig.textStart) / (currentConfig.textEnd - currentConfig.textStart))
        );
        const easedText = 1 - Math.pow(1 - textProgress, 2);

        if (textRef.current) {
          textRef.current.style.opacity = String(easedText);
          textRef.current.style.transform = `translateY(calc(-50% + ${(1 - easedText) * 50}px))`;
        }
      },
      onRefresh: (self) => {
        // Sync progress immediately when trigger is refreshed
        scrollProgressRef.current = self.progress;
        setScrollProgress(self.progress);
        updateSection4Progress(self.progress);
      },
    });

    // Immediately sync to current scroll position on mount
    scrollProgressRef.current = trigger.progress;
    setScrollProgress(trigger.progress);
    updateSection4Progress(trigger.progress);

    return () => trigger.kill();
  }, []);

  return (
    <>
      {/* Section trigger */}
      <section
        id="reentry-section"
        className="relative flex items-center justify-center overflow-hidden"
        style={{ height: config.sectionHeight }}
        aria-label="Atmospheric Re-entry"
      />

      {/* Heat distortion overlay */}
      <div className="fixed inset-0 z-[30] pointer-events-none">
        <HeatDistortion scrollProgress={scrollProgress} />
      </div>

      {/* 3D Canvas */}
      <div
        className="fixed inset-0 z-[31] pointer-events-none"
        aria-hidden="true"
      >
        <Canvas
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          camera={{ fov: 45, near: 0.1, far: 100 }}
        >
          <Scene
            scrollProgress={scrollProgressRef}
            onAsteroidPositionUpdate={handleAsteroidPositionUpdate}
            asteroidPaths={asteroidPaths}
            config={config}
            expandedAsteroidIndices={expandedAsteroidIndices}
            balloonExpanded={balloonExpanded}
          />
        </Canvas>
      </div>

      {/* Flame effects overlay */}
      <div className="fixed inset-0 z-[32] pointer-events-none">
        <FlameEffects
          asteroidPositions={asteroidPositions}
          scrollProgress={scrollProgress}
        />
      </div>

      {/* Text overlay */}
      <div
        ref={textRef}
        className="fixed top-1/2 right-6 md:right-12 lg:right-20 w-[90%] md:w-auto max-w-lg -translate-y-1/2 text-white text-right z-[33] pointer-events-none"
        style={{ opacity: 0, transform: "translateY(calc(-50% + 50px))" }}
      >
        <h2
          className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4 text-primary"
          style={{
            textShadow:
              "2px 2px 4px rgba(0,0,0,0.9), 0 0 30px rgba(252, 163, 17, 0.4)",
          }}
        >
          You are not alone
        </h2>
        <p
          className="text-sm md:text-base lg:text-lg text-white/85 leading-relaxed"
          style={{
            textShadow: "1px 1px 3px rgba(0,0,0,0.95)",
          }}
        >
          The world feels heavy sometimes. The noise, the uncertainty, the weight of it all.
          <br className="hidden md:block" />
          <span className="md:hidden"> </span>
          But even in freefall, there&apos;s a quiet truth —
          <br className="hidden md:block" />
          <span className="md:hidden"> </span>
          <em className="text-primary/90">we&apos;re all descending together.</em>
          <br />
          And somehow, that makes the fall a little lighter.
        </p>
      </div>

      {/* Debug Panel (dev only) */}
      {process.env.NODE_ENV === "development" && (
        <ReentryDebugPanel
          config={config}
          asteroidPaths={asteroidPaths}
          onConfigChange={handleConfigChange}
          onAsteroidPathChange={handleAsteroidPathChange}
          onReset={handleReset}
          onExpandedAsteroidsChange={handleExpandedAsteroidsChange}
          onBalloonExpandedChange={handleBalloonExpandedChange}
        />
      )}
    </>
  );
}

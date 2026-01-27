"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Clone, Center } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { signalReady } from "./LoadingScreen";
import RocketDebugPanel, { type RocketConfig } from "./debug/RocketDebugPanel";

gsap.registerPlugin(ScrollTrigger);

// Default animation constants
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

interface DebugPathPoint {
  x: number;
  y: number;
  progress: number;
}

interface RocketDebugInfo {
  world3D: { x: number; y: number; z: number };
  targetWorld: { x: number; y: number };
  scale: number;
  rotationRad: number;
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
  onReady,
  onDebugUpdate,
  config,
}: {
  scrollProgress: React.MutableRefObject<number>;
  onScreenPositionUpdate: (pos: ScreenPosition) => void;
  onReady: () => void;
  onDebugUpdate?: (info: RocketDebugInfo) => void;
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

    // Send debug info
    onDebugUpdate?.({
      world3D: { x: smoothedX.current, y: smoothedY.current, z: 0 },
      targetWorld: { x: targetX, y: targetY },
      scale: smoothedScale.current,
      rotationRad: smoothedRotation.current,
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
  onScreenPositionUpdate,
  onReady,
  onDebugUpdate,
  config,
}: {
  scrollProgress: React.MutableRefObject<number>;
  onScreenPositionUpdate: (pos: ScreenPosition) => void;
  onReady: () => void;
  onDebugUpdate?: (info: RocketDebugInfo) => void;
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
        onScreenPositionUpdate={onScreenPositionUpdate}
        onReady={onReady}
        onDebugUpdate={onDebugUpdate}
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

  // Large offset for depth illusion - light from top-right, shadow falls bottom-left
  const baseOffset = 120 + scrollProgress * 80;
  const offsetX = baseOffset * 0.6;
  const offsetY = baseOffset * 0.8;

  // Scale shadow based on "altitude" over moon
  const shadowScale = 1.0 + scrollProgress * 0.3;

  // Blur for soft shadow edge
  const shadowBlur = 8 + scrollProgress * 6;

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
          width: 10,
          height: 200,
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
          width: 9,
          height: 50,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, calc(-50% - 120px))",
          background: "rgba(0, 0, 0, 0.95)",
          borderRadius: "50% 50% 35% 35% / 85% 85% 15% 15%",
        }}
      />

      {/* Left booster */}
      <div
        className="absolute"
        style={{
          width: 6,
          height: 150,
          left: "50%",
          top: "50%",
          transform: "translate(calc(-50% - 10px), calc(-50% + 18px))",
          background: "rgba(0, 0, 0, 0.9)",
          borderRadius: "40% 40% 20% 20% / 3% 3% 2% 2%",
        }}
      />

      {/* Right booster */}
      <div
        className="absolute"
        style={{
          width: 6,
          height: 150,
          left: "50%",
          top: "50%",
          transform: "translate(calc(-50% + 10px), calc(-50% + 18px))",
          background: "rgba(0, 0, 0, 0.9)",
          borderRadius: "40% 40% 20% 20% / 3% 3% 2% 2%",
        }}
      />

      {/* Left booster nose */}
      <div
        className="absolute"
        style={{
          width: 5,
          height: 28,
          left: "50%",
          top: "50%",
          transform: "translate(calc(-50% - 10px), calc(-50% - 62px))",
          background: "rgba(0, 0, 0, 0.85)",
          borderRadius: "50% 50% 35% 35% / 75% 75% 25% 25%",
        }}
      />

      {/* Right booster nose */}
      <div
        className="absolute"
        style={{
          width: 5,
          height: 28,
          left: "50%",
          top: "50%",
          transform: "translate(calc(-50% + 10px), calc(-50% - 62px))",
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

function RocketDebugOverlay({
  screenPos,
  scrollProgress,
  debugInfo,
  pathPoints,
  config,
}: {
  screenPos: ScreenPosition;
  scrollProgress: number;
  debugInfo: RocketDebugInfo | null;
  pathPoints: DebugPathPoint[];
  config: RocketConfig;
}) {
  const rotationDeg = (screenPos.rotation * 180) / Math.PI;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Path trace visualization */}
      <svg className="absolute inset-0 w-full h-full">
        {/* Full theoretical path */}
        <path
          d={(() => {
            const points: string[] = [];
            for (let p = 0; p <= 1; p += 0.02) {
              const arcOffset = Math.sin(p * Math.PI) * config.arcHeight;
              const x = config.startX + (config.endX - config.startX) * p;
              const y = config.startY + (config.endY - config.startY) * p + arcOffset;
              // Convert 3D coords to approximate screen coords (assuming centered camera at z=10, fov=45)
              const screenX = (x / 10) * (window.innerHeight / 2) + window.innerWidth / 2;
              const screenY = (-y / 10) * (window.innerHeight / 2) + window.innerHeight / 2;
              points.push(`${points.length === 0 ? "M" : "L"} ${screenX} ${screenY}`);
            }
            return points.join(" ");
          })()}
          fill="none"
          stroke="rgba(100, 200, 255, 0.3)"
          strokeWidth="2"
          strokeDasharray="8 4"
        />

        {/* Actual traced path */}
        {pathPoints.length > 1 && (
          <path
            d={pathPoints
              .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`)
              .join(" ")}
            fill="none"
            stroke="rgba(255, 200, 50, 0.8)"
            strokeWidth="3"
          />
        )}

        {/* Path points */}
        {pathPoints.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={3}
            fill={`hsl(${pt.progress * 120}, 100%, 50%)`}
          />
        ))}

        {/* Current position marker */}
        {screenPos.visible && (
          <>
            {/* Crosshair */}
            <line
              x1={screenPos.x - 20}
              y1={screenPos.y}
              x2={screenPos.x + 20}
              y2={screenPos.y}
              stroke="rgba(255, 100, 100, 0.8)"
              strokeWidth="2"
            />
            <line
              x1={screenPos.x}
              y1={screenPos.y - 20}
              x2={screenPos.x}
              y2={screenPos.y + 20}
              stroke="rgba(255, 100, 100, 0.8)"
              strokeWidth="2"
            />
            {/* Direction indicator */}
            <line
              x1={screenPos.x}
              y1={screenPos.y}
              x2={screenPos.x + Math.sin(-screenPos.rotation) * 50}
              y2={screenPos.y - Math.cos(-screenPos.rotation) * 50}
              stroke="rgba(100, 255, 100, 0.9)"
              strokeWidth="3"
              markerEnd="url(#arrowhead)"
            />
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="rgba(100, 255, 100, 0.9)" />
              </marker>
            </defs>
          </>
        )}

        {/* Start and end markers */}
        <circle
          cx={(config.startX / 10) * (window.innerHeight / 2) + window.innerWidth / 2}
          cy={(-config.startY / 10) * (window.innerHeight / 2) + window.innerHeight / 2}
          r={8}
          fill="none"
          stroke="rgba(100, 255, 100, 0.6)"
          strokeWidth="2"
        />
        <text
          x={(config.startX / 10) * (window.innerHeight / 2) + window.innerWidth / 2 + 15}
          y={(-config.startY / 10) * (window.innerHeight / 2) + window.innerHeight / 2}
          fill="rgba(100, 255, 100, 0.8)"
          fontSize="12"
        >
          START
        </text>
        <circle
          cx={(config.endX / 10) * (window.innerHeight / 2) + window.innerWidth / 2}
          cy={(-config.endY / 10) * (window.innerHeight / 2) + window.innerHeight / 2}
          r={8}
          fill="none"
          stroke="rgba(255, 100, 100, 0.6)"
          strokeWidth="2"
        />
        <text
          x={(config.endX / 10) * (window.innerHeight / 2) + window.innerWidth / 2 + 15}
          y={(-config.endY / 10) * (window.innerHeight / 2) + window.innerHeight / 2}
          fill="rgba(255, 100, 100, 0.8)"
          fontSize="12"
        >
          END
        </text>
      </svg>

      {/* Debug info panel */}
      <div
        className="absolute top-4 right-4 bg-black/80 text-white p-4 rounded-lg font-mono text-xs pointer-events-auto"
        style={{ minWidth: 280 }}
      >
        <div className="text-yellow-400 font-bold mb-2 text-sm border-b border-yellow-400/30 pb-1">
          ROCKET DEBUG
        </div>

        <div className="space-y-2">
          <div>
            <span className="text-gray-400">Scroll Progress:</span>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-700 rounded overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all"
                  style={{ width: `${scrollProgress * 100}%` }}
                />
              </div>
              <span className="text-yellow-400 w-16 text-right">
                {(scrollProgress * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div>
              <span className="text-gray-400">Screen X:</span>
              <span className="text-cyan-400 ml-1">{screenPos.x.toFixed(1)}px</span>
            </div>
            <div>
              <span className="text-gray-400">Screen Y:</span>
              <span className="text-cyan-400 ml-1">{screenPos.y.toFixed(1)}px</span>
            </div>
          </div>

          {debugInfo && (
            <>
              <div className="border-t border-gray-600 pt-2 mt-2">
                <div className="text-gray-400 mb-1">3D World Position:</div>
                <div className="grid grid-cols-3 gap-1 text-center">
                  <div>
                    <span className="text-gray-500">X</span>
                    <div className="text-green-400">{debugInfo.world3D.x.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Y</span>
                    <div className="text-green-400">{debugInfo.world3D.y.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Z</span>
                    <div className="text-green-400">{debugInfo.world3D.z.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-gray-400">Target Position:</span>
                <span className="text-orange-400 ml-1">
                  ({debugInfo.targetWorld.x.toFixed(2)}, {debugInfo.targetWorld.y.toFixed(2)})
                </span>
              </div>

              <div>
                <span className="text-gray-400">Scale:</span>
                <span className="text-purple-400 ml-1">{debugInfo.scale.toFixed(4)}</span>
              </div>
            </>
          )}

          <div className="border-t border-gray-600 pt-2 mt-2">
            <div className="text-gray-400 mb-1">Rotation:</div>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 border-2 border-green-400 rounded-full relative"
              >
                <div
                  className="absolute w-1 h-4 bg-green-400 left-1/2 top-0 origin-bottom"
                  style={{
                    transform: `translateX(-50%) rotate(${-rotationDeg}deg)`,
                  }}
                />
              </div>
              <div>
                <div>
                  <span className="text-gray-500">Deg:</span>
                  <span className="text-green-400 ml-1">{rotationDeg.toFixed(1)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Rad:</span>
                  <span className="text-green-400 ml-1">{screenPos.rotation.toFixed(3)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-600 pt-2 mt-2 text-gray-500">
            <div>Visible: <span className={screenPos.visible ? "text-green-400" : "text-red-400"}>{screenPos.visible ? "YES" : "NO"}</span></div>
            <div>Path Points: <span className="text-cyan-400">{pathPoints.length}</span></div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-gray-600 text-gray-500 text-[10px]">
          Press <kbd className="bg-gray-700 px-1 rounded">D</kbd> to toggle debug
        </div>
      </div>
    </div>
  );
}

export default function Rocket3D() {
  const scrollProgressRef = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [screenPos, setScreenPos] = useState<ScreenPosition>({ x: 0, y: 0, rotation: 0, visible: false });
  const [trails, setTrails] = useState<TrailPoint[]>([]);
  const [isReady, setIsReady] = useState(false);
  const trailIdRef = useRef(0);
  const lastStateUpdateRef = useRef(0);
  const hasSignaledReady = useRef(false);

  // Config state
  const [config, setConfig] = useState<RocketConfig>(DEFAULT_CONFIG);
  const configRef = useRef(config);
  configRef.current = config;

  // Debug state
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<RocketDebugInfo | null>(null);
  const [debugPathPoints, setDebugPathPoints] = useState<DebugPathPoint[]>([]);
  const lastDebugProgressRef = useRef(-1);

  // Use refs to access current values in the interval without adding dependencies
  const screenPosRef = useRef(screenPos);
  const scrollProgressValRef = useRef(scrollProgress);
  screenPosRef.current = screenPos;
  scrollProgressValRef.current = scrollProgress;

  // Config change handlers
  const handleConfigChange = useCallback((key: keyof RocketConfig, value: number) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  const handleReady = useCallback(() => {
    setIsReady(true);
    if (!hasSignaledReady.current) {
      hasSignaledReady.current = true;
      signalReady();
    }
  }, []);

  // Debug keyboard toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "d" || e.key === "D") {
        setShowDebug((prev) => !prev);
      }
      // Clear path with 'c'
      if ((e.key === "c" || e.key === "C") && showDebug) {
        setDebugPathPoints([]);
        lastDebugProgressRef.current = -1;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showDebug]);

  // Debug info handler - records path points at progress intervals
  const handleDebugUpdate = useCallback((info: RocketDebugInfo) => {
    setDebugInfo(info);

    // Record path point every 5% progress
    const progressStep = Math.floor(scrollProgressRef.current * 20);
    if (progressStep !== lastDebugProgressRef.current && scrollProgressRef.current > 0) {
      lastDebugProgressRef.current = progressStep;
      setDebugPathPoints((prev) => {
        // Avoid duplicates at same progress
        if (prev.length > 0 && Math.abs(prev[prev.length - 1].progress - scrollProgressRef.current) < 0.03) {
          return prev;
        }
        // Convert 3D to screen coords
        const screenX = (info.world3D.x / 10) * (window.innerHeight / 2) + window.innerWidth / 2;
        const screenY = (-info.world3D.y / 10) * (window.innerHeight / 2) + window.innerHeight / 2;
        return [...prev, { x: screenX, y: screenY, progress: scrollProgressRef.current }];
      });
    }
  }, []);

  // Single interval for trail creation and fading with idle detection
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
        setScrollProgress(self.progress);
      },
    });

    // Immediately sync to current scroll position on mount
    scrollProgressRef.current = trigger.progress;
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
        <Canvas gl={{ antialias: true, alpha: true }} dpr={[1, 2]} camera={{ fov: 45, near: 0.1, far: 100 }}>
          <Scene
            scrollProgress={scrollProgressRef}
            onScreenPositionUpdate={handleScreenPositionUpdate}
            onReady={handleReady}
            onDebugUpdate={showDebug ? handleDebugUpdate : undefined}
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

      {/* Debug overlay */}
      {showDebug && (
        <RocketDebugOverlay
          screenPos={screenPos}
          scrollProgress={scrollProgress}
          debugInfo={debugInfo}
          pathPoints={debugPathPoints}
          config={config}
        />
      )}

      {/* Rocket Debug Panel (dev only) */}
      {process.env.NODE_ENV === "development" && (
        <RocketDebugPanel
          config={config}
          onConfigChange={handleConfigChange}
          onReset={handleReset}
        />
      )}
    </>
  );
}

useGLTF.preload("/assets/rocket.glb");

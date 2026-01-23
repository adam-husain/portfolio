"use client";

import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { Center } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useControls, Leva } from "leva";

gsap.registerPlugin(ScrollTrigger);

let ktx2Loader: KTX2Loader | null = null;

// ============================================================
// MODEL SELECTION - Change this to switch between models
// ============================================================
const ACTIVE_MODEL: "satellite" | "endurance" = "endurance";

// Satellite model config (original)
const SATELLITE_CONFIG = {
  model: "/assets/satellite.glb",
  scaleStart: 1.5,
  scaleEnd: 2,
  startX: 6,
  startY: -4,
  endX: -4.5,
  endY: -0.7,
  smoothing: 0.1,
  textStart: 0.2,
  textEnd: 0.5,
  // Transform
  scaleMultiplier: 1,
  startRotX: 0.358407346410207,
  startRotY: 0,
  startRotZ: 0,
  endRotX: 0.358407346410207,
  endRotY: 5.3,
  endRotZ: 0,
  // Lighting
  ambientIntensity: 0.6,
  directionalIntensity: 1.2,
  pointIntensity: 0.3,
  // Material
  opacity: 1,
  metalness: 0.5,
  roughness: 0.5,
  envMapIntensity: 1,
};

// Endurance model config (from debug sliders)
const ENDURANCE_CONFIG = {
  model: "/assets/endurance-optimized.glb",
  scaleStart: 1.5,
  scaleEnd: 2,
  startX: 7.0,
  startY: -6.0,
  endX: -6.3,
  endY: -1.5,
  smoothing: 0.1,
  textStart: 0.2,
  textEnd: 0.5,
  // Transform
  scaleMultiplier: 0.1,
  startRotX: -0.11,
  startRotY: 0,
  startRotZ: -1.5,
  endRotX: 0.5,
  endRotY: -2.0,
  endRotZ: -1.5,
  // Lighting
  ambientIntensity: 0.3,
  directionalIntensity: 1.1,
  pointIntensity: 0.4,
  // Material
  opacity: 1,
  metalness: 0.6,
  roughness: 0.65,
  envMapIntensity: 1,
};

const CONFIG = ACTIVE_MODEL === "endurance" ? ENDURANCE_CONFIG : SATELLITE_CONFIG;

function SatelliteModel({
  scrollProgress,
}: {
  scrollProgress: React.MutableRefObject<number>;
}) {
  const { gl, camera } = useThree();
  const satelliteRef = useRef<THREE.Group>(null);
  const smoothedValues = useRef({
    x: CONFIG.startX,
    y: CONFIG.startY,
    scale: CONFIG.scaleStart,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
  });

  // Debug controls - Transform
  const {
    scaleMultiplier,
    startPosX, startPosY, endPosX, endPosY,
    startRotX, startRotY, startRotZ,
    endRotX, endRotY, endRotZ
  } = useControls("Transform", {
    scaleMultiplier: { value: CONFIG.scaleMultiplier, min: 0.01, max: 3, step: 0.01 },
    startPosX: { value: CONFIG.startX, min: -10, max: 10, step: 0.1 },
    startPosY: { value: CONFIG.startY, min: -10, max: 10, step: 0.1 },
    endPosX: { value: CONFIG.endX, min: -10, max: 10, step: 0.1 },
    endPosY: { value: CONFIG.endY, min: -10, max: 10, step: 0.1 },
    startRotX: { value: CONFIG.startRotX, min: -Math.PI, max: Math.PI, step: 0.01 },
    startRotY: { value: CONFIG.startRotY, min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 },
    startRotZ: { value: CONFIG.startRotZ, min: -Math.PI, max: Math.PI, step: 0.01 },
    endRotX: { value: CONFIG.endRotX, min: -Math.PI, max: Math.PI, step: 0.01 },
    endRotY: { value: CONFIG.endRotY, min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 },
    endRotZ: { value: CONFIG.endRotZ, min: -Math.PI, max: Math.PI, step: 0.01 },
  });

  // Debug controls - Material
  const { opacity, wireframe, metalness, roughness, envMapIntensity } = useControls("Material", {
    opacity: { value: CONFIG.opacity, min: 0, max: 1, step: 0.01 },
    wireframe: false,
    metalness: { value: CONFIG.metalness, min: 0, max: 1, step: 0.01 },
    roughness: { value: CONFIG.roughness, min: 0, max: 1, step: 0.01 },
    envMapIntensity: { value: CONFIG.envMapIntensity, min: 0, max: 3, step: 0.1 },
  });

  const { colorMap, normalMap, aoMap, emissiveIntensity } = useControls("Textures", {
    colorMap: true,
    normalMap: true,
    aoMap: true,
    emissiveIntensity: { value: 0, min: 0, max: 2, step: 0.1 },
  });

  const gltf = useLoader(GLTFLoader, CONFIG.model, (loader) => {
    if (!ktx2Loader) {
      ktx2Loader = new KTX2Loader();
      ktx2Loader.setTranscoderPath(
        "https://cdn.jsdelivr.net/gh/pmndrs/drei-assets/basis/",
      );
    }
    ktx2Loader.detectSupport(gl);
    loader.setKTX2Loader(ktx2Loader);
    loader.setMeshoptDecoder(MeshoptDecoder);
  });

  // Store original material properties
  const originalMaterials = useMemo(() => {
    const materials = new Map<THREE.Material, {
      map: THREE.Texture | null;
      normalMap: THREE.Texture | null;
      aoMap: THREE.Texture | null;
      metalness: number;
      roughness: number;
    }>();

    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (!materials.has(mat)) {
          materials.set(mat, {
            map: mat.map,
            normalMap: mat.normalMap,
            aoMap: mat.aoMap,
            metalness: mat.metalness ?? 0.5,
            roughness: mat.roughness ?? 0.5,
          });
        }
      }
    });
    return materials;
  }, [gltf.scene]);

  // Apply debug controls to materials
  useEffect(() => {
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        const original = originalMaterials.get(mat);

        if (original) {
          mat.transparent = opacity < 1;
          mat.opacity = opacity;
          mat.wireframe = wireframe;
          mat.metalness = metalness;
          mat.roughness = roughness;
          mat.envMapIntensity = envMapIntensity;
          mat.emissiveIntensity = emissiveIntensity;

          // Toggle texture maps
          mat.map = colorMap ? original.map : null;
          mat.normalMap = normalMap ? original.normalMap : null;
          mat.aoMap = aoMap ? original.aoMap : null;

          mat.needsUpdate = true;
        }
      }
    });
  }, [gltf.scene, originalMaterials, opacity, wireframe, metalness, roughness, envMapIntensity, colorMap, normalMap, aoMap, emissiveIntensity]);

  useEffect(() => {
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame((_, delta) => {
    if (!satelliteRef.current) return;

    const progress = scrollProgress.current;

    // Ease-in-out
    const eased =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    // Target values
    const targetX = THREE.MathUtils.lerp(startPosX, endPosX, eased);
    const targetY = THREE.MathUtils.lerp(startPosY, endPosY, eased);
    const targetScale = THREE.MathUtils.lerp(
      CONFIG.scaleStart,
      CONFIG.scaleEnd,
      eased,
    ) * scaleMultiplier;
    const targetRotX = THREE.MathUtils.lerp(startRotX, endRotX, eased);
    const targetRotY = THREE.MathUtils.lerp(startRotY, endRotY, eased);
    const targetRotZ = THREE.MathUtils.lerp(startRotZ, endRotZ, eased);

    // Frame-rate independent smoothing
    const smoothFactor = 1 - Math.pow(1 - CONFIG.smoothing, delta * 60);

    // Smooth interpolation
    const sv = smoothedValues.current;
    sv.x = THREE.MathUtils.lerp(sv.x, targetX, smoothFactor);
    sv.y = THREE.MathUtils.lerp(sv.y, targetY, smoothFactor);
    sv.scale = THREE.MathUtils.lerp(sv.scale, targetScale, smoothFactor);
    sv.rotX = THREE.MathUtils.lerp(sv.rotX, targetRotX, smoothFactor);
    sv.rotY = THREE.MathUtils.lerp(sv.rotY, targetRotY, smoothFactor);
    sv.rotZ = THREE.MathUtils.lerp(sv.rotZ, targetRotZ, smoothFactor);

    satelliteRef.current.position.set(sv.x, sv.y, 0);
    satelliteRef.current.rotation.set(sv.rotX, sv.rotY, sv.rotZ);
    satelliteRef.current.scale.setScalar(sv.scale);
    satelliteRef.current.visible = progress > 0.02;
  });

  return (
    <group
      ref={satelliteRef}
      position={[CONFIG.startX, CONFIG.startY, 0]}
      scale={CONFIG.scaleStart}
    >
      <Center>
        <primitive object={gltf.scene.clone()} />
      </Center>
    </group>
  );
}

function Scene({
  scrollProgress,
}: {
  scrollProgress: React.MutableRefObject<number>;
}) {
  const { ambientIntensity, directionalIntensity, pointIntensity } = useControls("Lighting", {
    ambientIntensity: { value: CONFIG.ambientIntensity, min: 0, max: 2, step: 0.1 },
    directionalIntensity: { value: CONFIG.directionalIntensity, min: 0, max: 3, step: 0.1 },
    pointIntensity: { value: CONFIG.pointIntensity, min: 0, max: 2, step: 0.1 },
  });

  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <directionalLight position={[5, 5, 5]} intensity={directionalIntensity} color="#ffffff" />
      <directionalLight
        position={[-3, -2, 3]}
        intensity={0.4}
        color="#a0c4ff"
      />
      <pointLight position={[0, 0, 5]} intensity={pointIntensity} color="#ffd166" />
      <SatelliteModel scrollProgress={scrollProgress} />
    </>
  );
}

export default function Satellite3D() {
  const scrollProgressRef = useRef(0);
  const textStateRef = useRef({ opacity: 0, y: 40 });
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: "#satellite-section",
      start: "top bottom",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;

        // Calculate text animation
        const textRange = CONFIG.textEnd - CONFIG.textStart;
        const textProgress = Math.max(
          0,
          Math.min(1, (self.progress - CONFIG.textStart) / textRange),
        );
        const easedTextProgress = 1 - Math.pow(1 - textProgress, 2);

        textStateRef.current.opacity = easedTextProgress;
        textStateRef.current.y = (1 - easedTextProgress) * 40;

        // Update text element directly
        if (textRef.current) {
          textRef.current.style.opacity = String(easedTextProgress);
          textRef.current.style.transform = `translateY(calc(-50% + ${textStateRef.current.y}px))`;
        }
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <>
      {/* Leva Debug Panel */}
      <Leva collapsed={false} oneLineLabels={false} />

      {/* 3D Satellite Canvas */}
      <div
        className="fixed inset-0 z-[22] pointer-events-none satellite-canvas"
        aria-hidden="true"
      >
        <Canvas
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          camera={{ fov: 45, near: 0.1, far: 100 }}
        >
          <Scene scrollProgress={scrollProgressRef} />
        </Canvas>
      </div>

      {/* Embossed text overlay */}
      <div
        ref={textRef}
        className="fixed top-1/2 right-8 md:right-16 lg:right-24 -translate-y-1/2 text-white text-right z-[24] pointer-events-none"
        style={{ opacity: 0, transform: "translateY(calc(-50% + 40px))" }}
      >
        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
          style={{
            textShadow:
              "2px 2px 4px rgba(0,0,0,0.8), -1px -1px 0 rgba(255,255,255,0.1), 0 0 40px rgba(255,255,255,0.2)",
          }}
        >
          Do not go gentle into that good night
        </h2>
        <p
          className="text-base md:text-lg lg:text-xl text-white/80 leading-relaxed"
          style={{
            textShadow: "1px 1px 3px rgba(0,0,0,0.9)",
          }}
        >
          For old age should burn and rave at close of day.
          <br />
          Rage, rage against the dying of the light.
        </p>
      </div>
    </>
  );
}

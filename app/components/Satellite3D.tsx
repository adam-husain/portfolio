"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { Center } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { updateSection3Progress, useScrollProgress } from "@/app/lib/scrollProgress";
import { SECTION3_TIMING, FADE_TIMING, calculateFadeOut, mapRange } from "@/app/lib/animationTiming";

gsap.registerPlugin(ScrollTrigger);

let ktx2Loader: KTX2Loader | null = null;

// Change this to switch between models
const ACTIVE_MODEL: "satellite" | "endurance" = "endurance";

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
  scaleMultiplier: 1,
  startRotX: 0.358407346410207,
  startRotY: 0,
  startRotZ: 0,
  endRotX: 0.358407346410207,
  endRotY: 5.3,
  endRotZ: 0,
  ambientIntensity: 0.6,
  directionalIntensity: 1.2,
  pointIntensity: 0.3,
  metalness: 0.5,
  roughness: 0.5,
};

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
  scaleMultiplier: 0.1,
  startRotX: -0.11,
  startRotY: 0,
  startRotZ: -1.5,
  endRotX: 0.5,
  endRotY: -2.0,
  endRotZ: -1.5,
  ambientIntensity: 0.3,
  directionalIntensity: 1.1,
  pointIntensity: 0.4,
  metalness: 0.6,
  roughness: 0.65,
};

const CONFIG = ACTIVE_MODEL === "endurance" ? ENDURANCE_CONFIG : SATELLITE_CONFIG;

function SatelliteModel({
  scrollProgress,
  section4Progress,
}: {
  scrollProgress: React.MutableRefObject<number>;
  section4Progress: React.MutableRefObject<number>;
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

  useEffect(() => {
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        mat.metalness = CONFIG.metalness;
        mat.roughness = CONFIG.roughness;
        mat.needsUpdate = true;
      }
    });
  }, [gltf.scene]);

  useEffect(() => {
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame((_, delta) => {
    if (!satelliteRef.current) return;

    const progress = scrollProgress.current;

    // Custom easing: syncs with moon animation (ends at ~80% scroll progress)
    // Completes ~95% of animation by progress 0.8, then slows dramatically
    let eased: number;
    if (progress < 0.8) {
      const t = progress / 0.8;
      const easedT = 1 - Math.pow(1 - t, 3);
      eased = easedT * 0.95;
    } else {
      const t = (progress - 0.8) / 0.2;
      eased = 0.95 + t * 0.05;
    }

    const targetX = THREE.MathUtils.lerp(CONFIG.startX, CONFIG.endX, eased);
    const targetY = THREE.MathUtils.lerp(CONFIG.startY, CONFIG.endY, eased);
    const targetScale =
      THREE.MathUtils.lerp(CONFIG.scaleStart, CONFIG.scaleEnd, eased) *
      CONFIG.scaleMultiplier;
    const targetRotX = THREE.MathUtils.lerp(CONFIG.startRotX, CONFIG.endRotX, eased);
    const targetRotY = THREE.MathUtils.lerp(CONFIG.startRotY, CONFIG.endRotY, eased);
    const targetRotZ = THREE.MathUtils.lerp(CONFIG.startRotZ, CONFIG.endRotZ, eased);

    const smoothFactor = 1 - Math.pow(1 - CONFIG.smoothing, delta * 60);

    const sv = smoothedValues.current;
    sv.x = THREE.MathUtils.lerp(sv.x, targetX, smoothFactor);
    sv.y = THREE.MathUtils.lerp(sv.y, targetY, smoothFactor);
    sv.scale = THREE.MathUtils.lerp(sv.scale, targetScale, smoothFactor);
    sv.rotX = THREE.MathUtils.lerp(sv.rotX, targetRotX, smoothFactor);
    sv.rotY = THREE.MathUtils.lerp(sv.rotY, targetRotY, smoothFactor);
    sv.rotZ = THREE.MathUtils.lerp(sv.rotZ, targetRotZ, smoothFactor);

    // Calculate fade-out based on section 4 progress
    const s4Progress = section4Progress.current;
    const fadeOut = calculateFadeOut(
      s4Progress,
      SECTION3_TIMING.fadeOut.start,
      SECTION3_TIMING.fadeOut.end
    );

    // Apply fade-out: scale down and move off-screen
    const fadeScale = sv.scale * (0.5 + fadeOut * 0.5); // Scale down to 50% when faded
    const fadeX = sv.x + (1 - fadeOut) * -5; // Move left when fading
    const fadeY = sv.y + (1 - fadeOut) * -3; // Move down when fading

    satelliteRef.current.position.set(fadeX, fadeY, 0);
    satelliteRef.current.rotation.set(sv.rotX, sv.rotY, sv.rotZ);
    satelliteRef.current.scale.setScalar(fadeScale);
    satelliteRef.current.visible = progress > 0.02 && fadeOut > 0.01;
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
  section4Progress,
}: {
  scrollProgress: React.MutableRefObject<number>;
  section4Progress: React.MutableRefObject<number>;
}) {
  return (
    <>
      <ambientLight intensity={CONFIG.ambientIntensity} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={CONFIG.directionalIntensity}
        color="#ffffff"
      />
      <directionalLight position={[-3, -2, 3]} intensity={0.4} color="#a0c4ff" />
      <pointLight position={[0, 0, 5]} intensity={CONFIG.pointIntensity} color="#ffd166" />
      <SatelliteModel scrollProgress={scrollProgress} section4Progress={section4Progress} />
    </>
  );
}

export default function Satellite3D() {
  const scrollProgressRef = useRef(0);
  const section4ProgressRef = useRef(0);
  const textRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useScrollProgress();

  // Update section4 progress ref for 3D scene
  section4ProgressRef.current = scrollProgress.section4;

  // Get section4 progress for fade-out calculation (text)
  const section4FadeOut = calculateFadeOut(
    scrollProgress.section4,
    FADE_TIMING.section3TextFadeOut.start,
    FADE_TIMING.section3TextFadeOut.end
  );

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: "#satellite-section",
      start: "top bottom",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;
        updateSection3Progress(self.progress);
      },
      onRefresh: (self) => {
        // Sync progress immediately when trigger is refreshed
        scrollProgressRef.current = self.progress;
        updateSection3Progress(self.progress);
      },
    });

    // Immediately sync to current scroll position on mount
    scrollProgressRef.current = trigger.progress;
    updateSection3Progress(trigger.progress);

    return () => trigger.kill();
  }, []);

  // Calculate section3 text fade-in progress
  const section3Progress = scrollProgress.section3;
  const textRange = CONFIG.textEnd - CONFIG.textStart;
  const textProgress = Math.max(0, Math.min(1, (section3Progress - CONFIG.textStart) / textRange));
  const easedTextProgress = 1 - Math.pow(1 - textProgress, 2);

  // Update text opacity based on both section3 fade-in and section4 fade-out
  useEffect(() => {
    if (textRef.current) {
      const finalOpacity = easedTextProgress * section4FadeOut;
      textRef.current.style.opacity = String(finalOpacity);
      textRef.current.style.transform = `translateY(calc(-50% + ${(1 - easedTextProgress) * 40}px))`;
    }
  }, [easedTextProgress, section4FadeOut]);

  return (
    <>
      <div
        className="fixed inset-0 z-[22] pointer-events-none satellite-canvas"
        aria-hidden="true"
      >
        <Canvas
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          camera={{ fov: 45, near: 0.1, far: 100 }}
          style={{ pointerEvents: "none" }}
        >
          <Scene scrollProgress={scrollProgressRef} section4Progress={section4ProgressRef} />
        </Canvas>
      </div>

      <div
        ref={textRef}
        className="fixed top-1/2 right-4 md:right-16 lg:right-24 -translate-y-1/2 max-w-[90vw] md:max-w-lg text-white text-right z-[24] pointer-events-none"
        style={{ opacity: 0, transform: "translateY(calc(-50% + 40px))" }}
      >
        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 md:mb-4"
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

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

gsap.registerPlugin(ScrollTrigger);

let ktx2Loader: KTX2Loader | null = null;

const CONFIG = {
  scaleStart: 1.5,
  scaleEnd: 2,
  startX: 6,
  startY: -4,
  endX: -4.5,
  endY: -0.7,
  rotationX: 0.358407346410207,
  rotationY: 5.3,
  smoothing: 0.1,
  textStart: 0.2,
  textEnd: 0.5,
};

function SatelliteModel({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const { gl, camera } = useThree();
  const satelliteRef = useRef<THREE.Group>(null);
  const smoothedValues = useRef({
    x: CONFIG.startX,
    y: CONFIG.startY,
    scale: CONFIG.scaleStart,
    rotY: 0,
  });

  const gltf = useLoader(GLTFLoader, "/assets/satellite.glb", (loader) => {
    if (!ktx2Loader) {
      ktx2Loader = new KTX2Loader();
      ktx2Loader.setTranscoderPath("https://cdn.jsdelivr.net/gh/pmndrs/drei-assets/basis/");
    }
    ktx2Loader.detectSupport(gl);
    loader.setKTX2Loader(ktx2Loader);
    loader.setMeshoptDecoder(MeshoptDecoder);
  });

  useEffect(() => {
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame((_, delta) => {
    if (!satelliteRef.current) return;

    const progress = scrollProgress.current;

    // Ease-in-out
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    // Target values
    const targetX = THREE.MathUtils.lerp(CONFIG.startX, CONFIG.endX, eased);
    const targetY = THREE.MathUtils.lerp(CONFIG.startY, CONFIG.endY, eased);
    const targetScale = THREE.MathUtils.lerp(CONFIG.scaleStart, CONFIG.scaleEnd, eased);
    const targetRotY = eased * CONFIG.rotationY;

    // Frame-rate independent smoothing
    const smoothFactor = 1 - Math.pow(1 - CONFIG.smoothing, delta * 60);

    // Smooth interpolation
    const sv = smoothedValues.current;
    sv.x = THREE.MathUtils.lerp(sv.x, targetX, smoothFactor);
    sv.y = THREE.MathUtils.lerp(sv.y, targetY, smoothFactor);
    sv.scale = THREE.MathUtils.lerp(sv.scale, targetScale, smoothFactor);
    sv.rotY = THREE.MathUtils.lerp(sv.rotY, targetRotY, smoothFactor);

    satelliteRef.current.position.set(sv.x, sv.y, 0);
    satelliteRef.current.rotation.set(CONFIG.rotationX, sv.rotY, 0);
    satelliteRef.current.scale.setScalar(sv.scale);
    satelliteRef.current.visible = progress > 0.02;
  });

  return (
    <group ref={satelliteRef} position={[CONFIG.startX, CONFIG.startY, 0]} scale={CONFIG.scaleStart}>
      <Center>
        <primitive object={gltf.scene.clone()} />
      </Center>
    </group>
  );
}

function Scene({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-3, -2, 3]} intensity={0.4} color="#a0c4ff" />
      <pointLight position={[0, 0, 5]} intensity={0.3} color="#ffd166" />
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
        const textProgress = Math.max(0, Math.min(1, (self.progress - CONFIG.textStart) / textRange));
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
          Tell a story!
          <br />
          Describe your product!
        </h2>
        <p
          className="text-base md:text-lg lg:text-xl text-white/80 leading-relaxed"
          style={{
            textShadow: "1px 1px 3px rgba(0,0,0,0.9)",
          }}
        >
          Your website can be boring.
          <br />
          Or it can be like this one.
        </p>
      </div>
    </>
  );
}

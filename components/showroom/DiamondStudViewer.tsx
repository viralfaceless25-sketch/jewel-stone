"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import type { Group } from "three";

const GOLD: Record<string, { color: string; roughness: number; metalness: number }> = {
  white:  { color: "#C7C2B8", roughness: 0.07, metalness: 1.0 },
  yellow: { color: "#8B877E", roughness: 0.08, metalness: 1.0 },
  rose:   { color: "#8B877E", roughness: 0.07, metalness: 1.0 },
};

const PRONG_ANGLES = [0, 90, 180, 270];

function StudModel({ metal = "rose" }: { metal: string }) {
  const group = useRef<Group>(null);
  const gold = GOLD[metal] ?? GOLD.rose;

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    group.current.rotation.y = t * 0.38;
    group.current.position.y = Math.sin(t * 0.65) * 0.09;
    group.current.rotation.x = Math.sin(t * 0.28) * 0.035;
  });

  return (
    <group ref={group} scale={1.9} position={[0, 0, 0]}>
      {/* Diamond stone — icosahedron gives natural faceted look */}
      <mesh position={[0, 0.55, 0]} scale={[1, 0.72, 1]}>
        <icosahedronGeometry args={[0.78, 2]} />
        <meshPhysicalMaterial
          color="#F2F0EB"
          roughness={0.0}
          metalness={0}
          transmission={0.94}
          ior={2.42}
          reflectivity={1}
          clearcoat={1}
          clearcoatRoughness={0}
          envMapIntensity={3.5}
        />
      </mesh>

      {/* Girdle ring — thin torus at the widest part of the stone */}
      <mesh position={[0, 0.55, 0]}>
        <torusGeometry args={[0.77, 0.025, 12, 64]} />
        <meshStandardMaterial {...gold} envMapIntensity={2} />
      </mesh>

      {/* 4 prongs gripping the stone */}
      {PRONG_ANGLES.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const px = Math.sin(rad) * 0.65;
        const pz = Math.cos(rad) * 0.65;
        return (
          <group key={deg} position={[px, 0.62, pz]}>
            <mesh rotation={[Math.atan2(0.3, 0.65), rad, 0]}>
              <cylinderGeometry args={[0.042, 0.055, 0.52, 8]} />
              <meshStandardMaterial {...gold} envMapIntensity={2} />
            </mesh>
          </group>
        );
      })}

      {/* Setting basket — open cylinder */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.58, 0.5, 0.38, 32, 1, true]} />
        <meshStandardMaterial {...gold} side={2} envMapIntensity={1.5} />
      </mesh>

      {/* Basket bottom rim */}
      <mesh position={[0, 0.11, 0]}>
        <torusGeometry args={[0.54, 0.04, 12, 48]} />
        <meshStandardMaterial {...gold} envMapIntensity={2} />
      </mesh>

      {/* Base platform disc */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.48, 0.42, 0.1, 32]} />
        <meshStandardMaterial {...gold} envMapIntensity={1.5} />
      </mesh>

      {/* Post */}
      <mesh position={[0, -0.26, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.72, 12]} />
        <meshStandardMaterial {...gold} envMapIntensity={1} />
      </mesh>

      {/* Post tip (slightly tapered) */}
      <mesh position={[0, -0.65, 0]}>
        <cylinderGeometry args={[0, 0.038, 0.08, 10]} />
        <meshStandardMaterial {...gold} />
      </mesh>
    </group>
  );
}

export function DiamondStudViewer({ metal = "rose" }: { metal?: string }) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <PerspectiveCamera makeDefault position={[0, 0.3, 5.5]} fov={38} />
      <ambientLight intensity={0.18} />
      <spotLight
        position={[-3.5, 5, 4]}
        intensity={9}
        angle={0.35}
        penumbra={0.85}
        color="#141416"
        castShadow
      />
      <spotLight
        position={[3, 3.5, 3]}
        intensity={5}
        color="#1D1D20"
        angle={0.45}
        penumbra={0.9}
      />
      <spotLight
        position={[0, -3, 3]}
        intensity={3}
        color="#141416"
        angle={0.6}
        penumbra={1}
      />
      <spotLight
        position={[0, 4, -4]}
        intensity={4}
        color="#8B877E"
        angle={0.4}
        penumbra={0.8}
      />
      <Suspense fallback={null}>
        <StudModel metal={metal} />
        <Environment preset="studio" />
      </Suspense>
      <EffectComposer>
        <Bloom luminanceThreshold={0.45} luminanceSmoothing={0.88} intensity={2.2} />
      </EffectComposer>
    </Canvas>
  );
}

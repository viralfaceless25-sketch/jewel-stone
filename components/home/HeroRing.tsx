"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const MODEL = "/models/heart-halo-ring-opt.glb";
useGLTF.preload(MODEL);

function RoomLight() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const map = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    const previous = scene.environment;
    scene.environment = map;
    return () => {
      scene.environment = previous;
      map.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Ring({ reduced }: { reduced: boolean }) {
  const source = useGLTF(MODEL).scene;
  const group = useRef<THREE.Group>(null);
  const target = useRef(-0.32);
  const ring = useMemo(() => {
    const clone = source.clone(true);
    const bounds = new THREE.Box3().setFromObject(clone);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const scale = 2.55 / (Math.max(size.x, size.y, size.z) || 1);
    clone.position.addScaledVector(center, -scale);
    clone.scale.setScalar(scale);
    clone.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        if (material instanceof THREE.MeshStandardMaterial) {
          material.envMapIntensity = 1.75;
          material.needsUpdate = true;
        }
      });
    });
    return clone;
  }, [source]);

  useFrame((state, delta) => {
    if (!group.current || reduced) return;
    target.current += Math.min(delta, 0.05) * 0.14;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, target.current + state.pointer.x * 0.16, 5, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, 0.98 - state.pointer.y * 0.08, 5, delta);
  });

  return (
    <group ref={group} rotation={[0.98, -0.32, -0.06]} position={[0, 0.08, 0]}>
      <primitive object={ring} />
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.38]}>
        <torusGeometry args={[1.37, 0.012, 12, 128]} />
        <meshStandardMaterial color="#d8d7d2" metalness={1} roughness={0.16} envMapIntensity={2.2} />
      </mesh>
    </group>
  );
}

export function HeroRing() {
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={reduced ? "demand" : "always"}
      camera={{ position: [0, 0.15, 4.7], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMappingExposure = 1.12;
      }}
    >
      <RoomLight />
      <ambientLight intensity={0.48} />
      <directionalLight position={[4, 5, 5]} intensity={3.8} color="#ffffff" castShadow />
      <spotLight position={[-4, 2, 4]} intensity={42} angle={0.48} penumbra={0.85} color="#bfc7d2" />
      <Suspense fallback={null}>
        <Ring reduced={reduced} />
      </Suspense>
      <ContactShadows position={[0, -1.05, 0]} opacity={0.58} scale={3.3} blur={2.8} far={2.5} resolution={256} color="#000000" />
    </Canvas>
  );
}

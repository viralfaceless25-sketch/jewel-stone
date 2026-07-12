"use client";

import { Component, Suspense, useEffect, useMemo, useRef, type ErrorInfo, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Sparkles, useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { scrollState } from "@/lib/three/scrollState";
import { BrilliantDiamond } from "@/components/three/BrilliantDiamond";
import { usePathname } from "next/navigation";

/**
 * Persistent full-screen WebGL background. A single fixed, transparent R3F
 * canvas that sits behind all page content (the obsidian ThemeBackground shows
 * through). A polished ring is the hero subject; as the page
 * scrolls, GSAP-driven progress lerps the camera + gem through a sequence of
 * keyframe states (hero → gallery → timeline → services), matching the
 * agency-reel scroll-3D architecture.
 *
 * NEXT STEPS (scaffolded, not yet populated):
 *  - Add gallery / timeline / services 3D assets keyed to STATES[1..3].
 *  - Carve negative space into each DOM section so the gem reads through cleanly.
 */

const RING_MODEL_URL = "/models/heart-halo-ring-opt.glb";

useGLTF.preload(RING_MODEL_URL);

function RoomEnvironmentMap() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    const previousEnvironment = scene.environment;
    scene.environment = environment;

    return () => {
      scene.environment = previousEnvironment;
      environment.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  return null;
}

function HeartHaloRing() {
  const { scene } = useGLTF(RING_MODEL_URL);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const bounds = new THREE.Box3().setFromObject(clone);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z) || 1;

    const normalizedScale = 2.15 / maxDimension;
    clone.position.addScaledVector(center, -normalizedScale);
    clone.scale.setScalar(normalizedScale);
    clone.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    return clone;
  }, [scene]);

  return <primitive object={model} />;
}

class RingFallbackBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {}

  render() {
    return this.state.failed ? <BrilliantDiamond /> : this.props.children;
  }
}

type CamState = {
  /** page progress 0..1 at which this keyframe is fully reached */
  p: number;
  /** camera world position */
  cam: [number, number, number];
  /** gem world position */
  gem: [number, number, number];
  /** gem uniform scale */
  scale: number;
};

// The scroll timeline. Gem starts large on the RIGHT (wordmark sits left),
// then shrinks + glides back for the gallery, and the camera tracks DOWN
// through the timeline/services scenes below.
const STATES: CamState[] = [
  { p: 0.0, cam: [0, 0, 4.6], gem: [1.38, -0.12, 0], scale: 0.72 }, // 1 · Hero — centered inside the right-hand metal aperture
  { p: 0.3, cam: [0, 0.1, 6.4], gem: [3.3, 0.4, -1], scale: 0.85 }, // 2 · Gallery — retreat + flank
  { p: 0.62, cam: [0, -2.5, 6.0], gem: [-2.6, -2.3, -1], scale: 0.72 }, // 3 · Timeline — track down
  { p: 1.0, cam: [0, -4.7, 5.4], gem: [2.2, -4.7, -1], scale: 0.9 }, // 4 · Services — final scene
];

const _cam = new THREE.Vector3();
const _gem = new THREE.Vector3();

function lerpTriple(a: [number, number, number], b: [number, number, number], t: number, out: THREE.Vector3) {
  out.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
}

function DiamondRig({ reduce }: { reduce: boolean }) {
  const gem = useRef<THREE.Group>(null);
  const pad = useRef<THREE.Mesh>(null);
  const scaleRef = useRef(STATES[0].scale);
  const baseCrownAngle = Math.PI / 2 - 0.16;
  const rotation = useRef(new THREE.Vector3(baseCrownAngle, -0.2, 0.035));
  const rotationTarget = useRef(new THREE.Vector3(baseCrownAngle, -0.2, 0.035));
  const { camera } = useThree();

  useFrame(({ pointer }, delta) => {
    const dt = Math.min(delta, 0.05);

    // Damp progress toward the scroll target for extra smoothness on top of Lenis.
    scrollState.current = reduce ? 0 : THREE.MathUtils.damp(scrollState.current, scrollState.target, 6, dt);
    const p = scrollState.current;

    // Locate the active timeline segment and interpolate within it.
    let i = 0;
    while (i < STATES.length - 1 && p > STATES[i + 1].p) i++;
    const a = STATES[i];
    const b = STATES[Math.min(i + 1, STATES.length - 1)];
    const t = a.p === b.p ? 0 : THREE.MathUtils.clamp((p - a.p) / (b.p - a.p), 0, 1);

    lerpTriple(a.cam, b.cam, t, _cam);
    lerpTriple(a.gem, b.gem, t, _gem);
    const targetScale = a.scale + (b.scale - a.scale) * t;

    // Camera: damp toward the keyframe, always looking straight ahead so
    // decreasing Y reads as a downward "track" through the scene.
    camera.position.x = THREE.MathUtils.damp(camera.position.x, _cam.x, 5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, _cam.y, 5, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, _cam.z, 5, dt);
    camera.lookAt(camera.position.x, camera.position.y, 0);

    const mesh = gem.current;
    if (mesh) {
      const px = reduce ? 0 : pointer.x * 0.16;
      const py = reduce ? 0 : pointer.y * 0.1;
      mesh.position.x = THREE.MathUtils.damp(mesh.position.x, _gem.x + px, 5, dt);
      mesh.position.y = THREE.MathUtils.damp(mesh.position.y, _gem.y + py, 5, dt);
      mesh.position.z = THREE.MathUtils.damp(mesh.position.z, _gem.z, 5, dt);
      scaleRef.current = THREE.MathUtils.damp(scaleRef.current, targetScale, 5, dt);
      mesh.scale.setScalar(scaleRef.current);
      // Every axis eases toward a target; reduced motion keeps the opening pose frozen.
      if (!reduce) {
        rotationTarget.current.set(baseCrownAngle + p * 0.8, rotationTarget.current.y + dt * 0.22, 0.035 + p * 0.12);
        rotation.current.x = THREE.MathUtils.damp(rotation.current.x, rotationTarget.current.x, 6, dt);
        rotation.current.y = THREE.MathUtils.damp(rotation.current.y, rotationTarget.current.y, 6, dt);
        rotation.current.z = THREE.MathUtils.damp(rotation.current.z, rotationTarget.current.z, 6, dt);
      }
      mesh.rotation.set(rotation.current.x, rotation.current.y, rotation.current.z);
    }

    if (pad.current) {
      const material = pad.current.material as THREE.MeshStandardMaterial;
      material.opacity = THREE.MathUtils.damp(material.opacity, p < 0.16 ? 0.98 : 0, 7, dt);
      pad.current.visible = material.opacity > 0.01;
    }
  });

  return (
    <>
      <mesh ref={pad} position={[STATES[0].gem[0], STATES[0].gem[1], -0.72]}>
        <circleGeometry args={[0.84, 96]} />
        <meshStandardMaterial color="#0A0A0B" roughness={0.3} metalness={0.62} envMapIntensity={1.4} transparent opacity={0.98} />
      </mesh>
      <group ref={gem} position={STATES[0].gem} scale={STATES[0].scale} rotation={[baseCrownAngle, -0.2, 0.035]}>
        <RingFallbackBoundary>
          <Suspense fallback={<BrilliantDiamond />}>
            <HeartHaloRing />
          </Suspense>
        </RingFallbackBoundary>
        {!reduce && (
          <>
            <Sparkles count={28} scale={[2.7, 2.7, 1.7]} size={2.5} speed={0.18} opacity={0.72} color="#F2F0EB" />
            <Sparkles count={16} scale={[2.35, 2.35, 1.5]} size={1.8} speed={0.12} opacity={0.58} color="#C7C2B8" />
          </>
        )}
      </group>
    </>
  );
}

export function ScrollScene() {
  const pathname = usePathname();
  const reduce =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The persistent scene belongs to the home-page scroll narrative. Keeping it
  // off inner routes prevents the fixed canvas from veiling product imagery.
  if (pathname !== "/") return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[5]" aria-hidden="true">
      <Canvas
        dpr={[1, Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio, 2)]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMappingExposure = 1.18;
        }}
        camera={{ position: [0, 0, 4.6], fov: 38 }}
        frameloop={reduce ? "demand" : "always"}
      >
        <ambientLight intensity={0.85} color="#F2F0EB" />
        <directionalLight position={[5, 6, 5]} intensity={3.6} color="#F2F0EB" />
        <pointLight position={[-4, -2, 4]} intensity={58} color="#C7C2B8" />
        <pointLight position={[4, 2, 3]} intensity={62} color="#F2F0EB" />
        <pointLight position={[0, 3, -2]} intensity={34} color="#8B877E" />
        <directionalLight position={[4.5, 5.5, 4]} intensity={4.4} color="#FFD9C2" castShadow />
        <spotLight position={[-4, 2.5, -2]} intensity={90} color="#D9E5FF" angle={0.48} penumbra={0.8} />

        <RoomEnvironmentMap />

        <DiamondRig reduce={reduce} />

        <ContactShadows
          position={[STATES[0].gem[0], STATES[0].gem[1] - 0.76, -0.08]}
          opacity={0.48}
          scale={2.35}
          blur={2.8}
          far={2.4}
          resolution={512}
          color="#020203"
        />

        <EffectComposer>
          <Bloom mipmapBlur intensity={0.45} luminanceThreshold={0.82} luminanceSmoothing={0.16} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

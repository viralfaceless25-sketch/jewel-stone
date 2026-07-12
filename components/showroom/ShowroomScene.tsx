"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshReflectorMaterial, PerspectiveCamera, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { AnimatePresence, motion } from "framer-motion";
import type { Group } from "three";
import { products, type Product } from "@/data/products";
import { ActionButton } from "@/components/Buttons";
import { useInquiryStore } from "@/store/inquiry";
import { FloatingDiamond } from "@/components/showroom/FloatingDiamond";
import { ProductDisplayCase } from "@/components/showroom/ProductDisplayCase";

function CameraRig() {
  const { camera } = useThree();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    camera.position.x += (Math.sin(t * 0.14) * 0.65 - camera.position.x) * 0.018;
    camera.position.y += (4.4 + Math.sin(t * 0.09) * 0.15 - camera.position.y) * 0.018;
    camera.position.z += (13 - camera.position.z) * 0.018;
    camera.lookAt(0, 1.5, 0);
  });

  return null;
}

function SatinWall({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <boxGeometry args={[28, 7, 0.18]} />
      <meshStandardMaterial color="#141416" roughness={0.78} metalness={0.02} />
    </mesh>
  );
}

function SceneInterior({ showroomProducts, onSelect }: { showroomProducts: Product[]; onSelect: (product: Product) => void }) {
  const groupRef = useRef<Group>(null);
  const cases = useMemo(
    () => [
      { pos: [-4.8, 0, -3.5] as [number, number, number], accent: "#C7C2B8", product: showroomProducts[0] },
      { pos: [0, 0, -4.5] as [number, number, number], accent: "#C7C2B8", product: showroomProducts[1] },
      { pos: [4.8, 0, -3.5] as [number, number, number], accent: "#C7C2B8", product: showroomProducts[2] },
      { pos: [-3.0, 0, -0.5] as [number, number, number], accent: "#C7C2B8", product: showroomProducts[3] },
      { pos: [3.0, 0, -0.5] as [number, number, number], accent: "#C7C2B8", product: showroomProducts[4] },
      { pos: [0, 0, 2.2] as [number, number, number], accent: "#C7C2B8", product: showroomProducts[5] }
    ],
    [showroomProducts]
  );

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.35) * 0.035;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <planeGeometry args={[36, 26]} />
        <MeshReflectorMaterial
          color="#141416"
          roughness={0.38}
          metalness={0.06}
          mirror={0.35}
          resolution={512}
          mixBlur={6}
          mixStrength={0.7}
          depthScale={0.9}
        />
      </mesh>
      <SatinWall position={[0, 3.4, -8.5]} />
      <SatinWall position={[-13, 3.4, 0]} rotation={[0, Math.PI / 2, 0]} />
      <SatinWall position={[13, 3.4, 0]} rotation={[0, -Math.PI / 2, 0]} />
      <mesh position={[0, 3.5, -8.2]}>
        <torusGeometry args={[1.6, 0.03, 16, 160]} />
        <meshStandardMaterial color="#C7C2B8" roughness={0.15} metalness={0.88} />
      </mesh>
      <FloatingDiamond position={[0, 3.5, -8.2]} scale={0.72} color="#F2F0EB" />

      {cases.map((item) => (
        <ProductDisplayCase key={item.product?.id ?? item.pos.join(",")} position={item.pos} accent={item.accent} product={item.product} onSelect={onSelect} />
      ))}

      <Sparkles count={80} scale={[18, 5, 14]} size={2.2} speed={0.14} opacity={0.48} color="#C7C2B8" />
    </group>
  );
}

function ProductInfoPanel({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const addItem = useInquiryStore((state) => state.addItem);

  return (
    <AnimatePresence>
      {product ? (
        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 18 }}
          className="absolute bottom-5 left-5 right-5 z-20 border border-rose/25 bg-ivory/92 p-4 shadow-case backdrop-blur-xl md:left-auto md:w-[23rem]"
          role="dialog"
          aria-label={`${product.name} showroom details`}
        >
          <button type="button" onClick={onClose} className="absolute right-3 top-3 text-sm text-ink/62" aria-label="Close product panel">
            Close
          </button>
          <div className="grid grid-cols-[88px_1fr] gap-4">
            <Image src={product.image} alt={product.name} width={120} height={120} className="aspect-square bg-marble object-contain p-2" />
            <div>
              <p className="eyebrow">{product.category}</p>
              <h3 className="mt-1 font-display text-3xl leading-none">{product.name}</h3>
              <p className="mt-2 text-sm text-velvet">{product.priceLabel}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-ink/68">{product.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <ActionButton onClick={() => addItem(product)}>Add to inquiry</ActionButton>
            <Link href={`/products/${product.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-rose/30 px-5 text-sm">
              Full details
            </Link>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

export function ShowroomScene({ featuredOnly = false }: { featuredOnly?: boolean }) {
  const showroomProducts = featuredOnly ? products.filter((product) => product.featured) : products;
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className="relative h-[80vh] min-h-[40rem] overflow-hidden border border-champagne/20 bg-[#141416] shadow-case">
      <Canvas shadows dpr={[1, 1.75]} gl={{ antialias: true, powerPreference: "high-performance" }}>
        <PerspectiveCamera makeDefault position={[0, 4.4, 13]} fov={55} />
        <color attach="background" args={["#141416"]} />
        <ambientLight intensity={0.74} color="#F2F0EB" />
        <spotLight position={[-6, 9, 3]} intensity={4.2} angle={0.45} penumbra={0.85} color="#F2F0EB" castShadow />
        <spotLight position={[6, 8, 3]} intensity={3.1} color="#C7C2B8" angle={0.45} penumbra={0.8} />
        <spotLight position={[0, 11, -2]} intensity={4.4} angle={0.55} penumbra={0.9} color="#F2F0EB" />
        <spotLight position={[-6, 8, -5]} intensity={2.8} angle={0.5} penumbra={0.9} color="#C7C2B8" />
        <spotLight position={[6, 8, -5]} intensity={3.2} angle={0.5} penumbra={0.9} color="#8B877E" />
        <pointLight position={[-2.4, 4.5, -6.4]} intensity={24} color="#F2F0EB" />
        <pointLight position={[2.4, 3.8, -6.8]} intensity={26} color="#C7C2B8" />
        <Suspense fallback={null}>
          <SceneInterior showroomProducts={showroomProducts} onSelect={setSelectedProduct} />
        </Suspense>
        <EffectComposer>
          <Bloom luminanceThreshold={0.48} luminanceSmoothing={0.9} intensity={1.05} />
          <Vignette eskil={false} offset={0.38} darkness={0.18} />
        </EffectComposer>
        <CameraRig />
      </Canvas>
      <div className="pointer-events-none absolute left-5 top-5 z-10 max-w-sm text-ink">
        <p className="eyebrow text-champagne">3D Rose-gold showroom</p>
        <h2 className="mt-3 font-display text-4xl leading-none md:text-6xl">Move through light, glass, and diamonds.</h2>
      </div>
      <ProductInfoPanel product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}

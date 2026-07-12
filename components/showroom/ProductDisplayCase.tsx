"use client";

import type { ThreeEvent } from "@react-three/fiber";
import type { Product } from "@/data/products";
import { FloatingDiamond } from "@/components/showroom/FloatingDiamond";
import { JewelryHotspot } from "@/components/showroom/JewelryHotspot";

export function ProductDisplayCase({
  position,
  product,
  onSelect,
  accent = "#C7C2B8"
}: {
  position: [number, number, number];
  product?: Product;
  onSelect?: (product: Product) => void;
  accent?: string;
}) {
  function handleSelect(event?: ThreeEvent<MouseEvent>) {
    event?.stopPropagation();
    if (product) onSelect?.(product);
  }

  return (
    <group
      position={position}
      onClick={handleSelect}
      onPointerOver={() => {
        if (product) document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      {/* Base pedestal */}
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.1, 1.5]} />
        <meshStandardMaterial color="#8B877E" roughness={0.28} metalness={0.18} />
      </mesh>
      {/* Glass showcase walls — four thin panes instead of one block */}
      {/* front */}
      <mesh position={[0, 1.55, 0.74]}>
        <boxGeometry args={[2.18, 0.88, 0.04]} />
        <meshPhysicalMaterial color="#1D1D20" roughness={0} metalness={0} transmission={0.88} thickness={0.04} ior={1.5} transparent opacity={0.22} />
      </mesh>
      {/* back */}
      <mesh position={[0, 1.55, -0.74]}>
        <boxGeometry args={[2.18, 0.88, 0.04]} />
        <meshPhysicalMaterial color="#1D1D20" roughness={0} metalness={0} transmission={0.88} thickness={0.04} ior={1.5} transparent opacity={0.22} />
      </mesh>
      {/* left */}
      <mesh position={[-1.08, 1.55, 0]}>
        <boxGeometry args={[0.04, 0.88, 1.44]} />
        <meshPhysicalMaterial color="#1D1D20" roughness={0} metalness={0} transmission={0.88} thickness={0.04} ior={1.5} transparent opacity={0.22} />
      </mesh>
      {/* right */}
      <mesh position={[1.08, 1.55, 0]}>
        <boxGeometry args={[0.04, 0.88, 1.44]} />
        <meshPhysicalMaterial color="#1D1D20" roughness={0} metalness={0} transmission={0.88} thickness={0.04} ior={1.5} transparent opacity={0.22} />
      </mesh>
      {/* glass top panel */}
      <mesh position={[0, 2.0, 0]}>
        <boxGeometry args={[2.18, 0.04, 1.44]} />
        <meshStandardMaterial color="#8B877E" roughness={0.1} metalness={0.3} />
      </mesh>
      {/* Rose gold frame — top */}
      <mesh position={[0, 2.02, 0.77]} castShadow>
        <boxGeometry args={[2.36, 0.05, 0.05]} />
        <meshStandardMaterial color="#C7C2B8" roughness={0.12} metalness={0.92} />
      </mesh>
      <mesh position={[0, 2.02, -0.77]} castShadow>
        <boxGeometry args={[2.36, 0.05, 0.05]} />
        <meshStandardMaterial color="#C7C2B8" roughness={0.12} metalness={0.92} />
      </mesh>
      <mesh position={[1.1, 2.02, 0]} castShadow>
        <boxGeometry args={[0.05, 0.05, 1.54]} />
        <meshStandardMaterial color="#C7C2B8" roughness={0.12} metalness={0.92} />
      </mesh>
      <mesh position={[-1.1, 2.02, 0]} castShadow>
        <boxGeometry args={[0.05, 0.05, 1.54]} />
        <meshStandardMaterial color="#C7C2B8" roughness={0.12} metalness={0.92} />
      </mesh>
      {/* Accent ring pedestal inside case */}
      <mesh position={[0, 1.14, 0]}>
        <cylinderGeometry args={[0.42, 0.52, 0.2, 48]} />
        <meshStandardMaterial color={accent} roughness={0.2} metalness={0.82} />
      </mesh>
      <FloatingDiamond position={[0, 1.68, 0]} scale={0.44} color={product?.category === "Loose Diamonds" ? "#F2F0EB" : "#1D1D20"} />

      {product ? (
        <JewelryHotspot label={product.name} position={[0, 2.6, 0]} onClick={() => onSelect?.(product)} />
      ) : null}
    </group>
  );
}

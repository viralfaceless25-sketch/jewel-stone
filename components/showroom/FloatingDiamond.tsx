"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { BrilliantDiamond } from "@/components/three/BrilliantDiamond";

export function FloatingDiamond({
  position = [0, 0, 0],
  scale = 1,
  color = "#141416"
}: {
  position?: [number, number, number];
  scale?: number;
  color?: string;
}) {
  const meshRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = clock.elapsedTime * 0.6;
    meshRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.55) * 0.12;
    meshRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.7) * 0.045;
    meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.9) * 0.12;
    meshRef.current.position.x = position[0] + Math.sin(clock.elapsedTime * 0.48) * 0.025;
  });

  return (
    <BrilliantDiamond ref={meshRef} scale={scale} position={position} resolution={128} frames={1} />
  );
}

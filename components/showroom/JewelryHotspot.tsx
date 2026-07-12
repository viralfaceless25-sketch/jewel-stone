"use client";

import { Html } from "@react-three/drei";

export function JewelryHotspot({
  label,
  position,
  onClick
}: {
  label: string;
  position: [number, number, number];
  onClick: () => void;
}) {
  return (
    <Html position={position} center distanceFactor={8}>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        className="showroom-hotspot"
        aria-label={`View ${label}`}
      >
        <span />
      </button>
    </Html>
  );
}

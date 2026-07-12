"use client";

import { forwardRef, useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type BrilliantDiamondProps = JSX.IntrinsicElements["group"] & {
  /** Retained for existing call sites; the stable PMREM environment needs no cube-camera resolution. */
  resolution?: number;
  frames?: number;
};

/** A purpose-built round brilliant: table, crown, girdle and pavilion are separate facet bands. */
function createBrilliantGeometry() {
  const segments = 16;
  const rings = [
    { radius: 0, y: 0.48, offset: 0 },
    { radius: 0.43, y: 0.48, offset: Math.PI / segments },
    { radius: 0.72, y: 0.25, offset: 0 },
    { radius: 1, y: 0.035, offset: Math.PI / segments },
    { radius: 1, y: -0.035, offset: Math.PI / segments },
    { radius: 0.58, y: -0.48, offset: 0 },
    { radius: 0, y: -1.08, offset: 0 },
  ];
  const vertices: number[] = [];
  const point = (ring: number, i: number) => {
    const r = rings[ring];
    const a = (i / segments) * Math.PI * 2 + r.offset;
    return new THREE.Vector3(Math.cos(a) * r.radius, r.y, Math.sin(a) * r.radius);
  };
  const tri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => {
    vertices.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  };

  const top = new THREE.Vector3(0, rings[0].y, 0);
  const culet = new THREE.Vector3(0, rings[6].y, 0);
  for (let i = 0; i < segments; i++) {
    const n = (i + 1) % segments;
    tri(top, point(1, i), point(1, n));
    for (let r = 1; r < 5; r++) {
      const a = point(r, i), b = point(r, n), c = point(r + 1, i), d = point(r + 1, n);
      // Alternating diagonals create readable kite and star facets.
      if ((i + r) % 2) { tri(a, c, b); tri(b, c, d); }
      else { tri(a, d, b); tri(a, c, d); }
    }
    tri(point(5, i), culet, point(5, n));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

export const BrilliantDiamond = forwardRef<THREE.Group, BrilliantDiamondProps>(
  function BrilliantDiamond({ resolution: _resolution, frames: _frames, ...props }, ref) {
    const { gl, scene } = useThree();
    const geometry = useMemo(createBrilliantGeometry, []);
    const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 24), [geometry]);
    const environment = useMemo(() => {
      const pmrem = new THREE.PMREMGenerator(gl);
      pmrem.compileCubemapShader();
      const room = new RoomEnvironment();
      const texture = pmrem.fromScene(room, 0.025).texture;
      room.dispose();
      pmrem.dispose();
      return texture;
    }, [gl]);

    useEffect(() => {
      const previous = scene.environment;
      scene.environment = environment;
      return () => {
        if (scene.environment === environment) scene.environment = previous;
        environment.dispose();
        geometry.dispose();
        edges.dispose();
      };
    }, [edges, environment, geometry, scene]);

    return (
      <group ref={ref} {...props}>
        <mesh geometry={geometry} castShadow frustumCulled={false}>
          <meshPhysicalMaterial
            envMap={environment}
            color="#F2F0EB"
            transmission={1}
            dispersion={1.2}
            ior={2.42}
            thickness={0.92}
            roughness={0.025}
            metalness={0}
            envMapIntensity={1.65}
            attenuationColor="#F2F0EB"
            attenuationDistance={8}
            clearcoat={1}
            clearcoatRoughness={0.02}
            specularIntensity={1}
            toneMapped
          />
        </mesh>
        <lineSegments geometry={edges} scale={1.004}>
          <lineBasicMaterial color="#F2F0EB" transparent opacity={0.48} toneMapped />
        </lineSegments>
        <lineSegments geometry={edges} scale={1.009} rotation-y={0.012}>
          <lineBasicMaterial color="#C7C2B8" transparent opacity={0.22} toneMapped />
        </lineSegments>
      </group>
    );
  },
);

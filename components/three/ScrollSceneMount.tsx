"use client";

import dynamic from "next/dynamic";
import { ScrollDriver } from "./ScrollDriver";

// R3F can't SSR (needs WebGL/window), so load the canvas client-only.
const ScrollScene = dynamic(() => import("./ScrollScene").then((m) => m.ScrollScene), {
  ssr: false,
});

/**
 * Client entry point for the scroll-driven 3D background: the ScrollTrigger
 * driver (DOM) + the WebGL canvas (client-only). Rendered once in the root
 * layout, behind all page content.
 */
export function ScrollSceneMount() {
  return (
    <>
      <ScrollDriver />
      <ScrollScene />
    </>
  );
}

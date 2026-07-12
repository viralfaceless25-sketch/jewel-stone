"use client";

import { useEffect, useRef } from "react";
import { scrollState } from "@/lib/three/scrollState";

const BLOBS = [
  { color: "#3B3B40", x: 0.82, y: 0.08, radius: 0.42, dx: 0.00011, dy: 0.00007 },
  { color: "#1D1D20", x: 0.08, y: 0.3, radius: 0.4, dx: -0.00008, dy: 0.0001 },
  { color: "#2A2A2E", x: 0.6, y: 0.88, radius: 0.44, dx: 0.00007, dy: -0.00009 },
  { color: "#8B877E", x: 0.72, y: 0.42, radius: 0.3, dx: -0.00006, dy: -0.00007 },
] as const;

export function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let mouseX = 0;
    let mouseY = 0;
    let lastDraw = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time = 0) => {
      if (!reducedMotion.matches && time - lastDraw < 32) {
        frame = requestAnimationFrame(draw);
        return;
      }
      lastDraw = time;
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "screen";

      BLOBS.forEach((blob, index) => {
        const motion = reducedMotion.matches ? 0 : time;
        const velocity = Math.max(-1, Math.min(1, scrollState.velocity / 2200));
        const x = (blob.x + Math.sin(motion * blob.dx + index) * 0.1 + mouseX * (0.012 + index * .003) + velocity * .025) * width;
        const y = (blob.y + Math.cos(motion * blob.dy + index * 1.7) * 0.09 + mouseY * (0.01 + index * .002) - velocity * .018) * height;
        const radius = blob.radius * Math.max(width, height);
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `${blob.color}32`);
        gradient.addColorStop(0.48, `${blob.color}18`);
        gradient.addColorStop(1, `${blob.color}00`);
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
      });

      context.globalCompositeOperation = "source-over";
      if (!reducedMotion.matches) frame = requestAnimationFrame(draw);
    };

    const restart = () => {
      cancelAnimationFrame(frame);
      draw();
    };

    resize();
    draw();
    const onPointer = (event: PointerEvent) => {
      mouseX = event.clientX / Math.max(1, width) - .5;
      mouseY = event.clientY / Math.max(1, height) - .5;
    };
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    reducedMotion.addEventListener("change", restart);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      reducedMotion.removeEventListener("change", restart);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-[2] opacity-35"
        style={{ filter: "blur(90px) saturate(.35)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-[1]"
        style={{ background: "radial-gradient(ellipse at 50% 35%, transparent 28%, rgba(0,0,0,.52) 100%)" }}
      />
    </>
  );
}

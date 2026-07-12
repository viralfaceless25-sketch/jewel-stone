"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

type Turntable3DProps = {
  /** Ordered list of frame image URLs that make up one full rotation. */
  frames: string[];
  /** Poster shown while frames preload (defaults to the first frame). */
  poster?: string;
  alt: string;
  /** Pixels of horizontal drag that advance one frame. Lower = more sensitive. */
  dragSensitivity?: number;
  /** Preload frames immediately (hero). When false, waits until near the viewport. */
  priority?: boolean;
  className?: string;
};

/**
 * Fake-3D turntable built from a real photographed frame sequence.
 * - Drag (pointer/touch) to rotate, with release inertia.
 * - Gentle idle auto-spin until the user interacts; pauses on hover.
 * - Mouse-parallax tilt + float for depth.
 * - Honours prefers-reduced-motion (static poster, still draggable).
 */
export function Turntable3D({
  frames,
  poster,
  alt,
  dragSensitivity = 6,
  priority = false,
  className = "",
}: Turntable3DProps) {
  const reduceMotion = useReducedMotion();
  const count = frames.length;

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [inView, setInView] = useState(priority);
  const [ready, setReady] = useState(false);
  const [loadedPct, setLoadedPct] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Defer preloading until the object is near the viewport (unless priority).
  useEffect(() => {
    if (priority || inView || !containerRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px" },
    );
    io.observe(containerRef.current);
    return () => io.disconnect();
  }, [priority, inView]);

  // Rotation state kept in refs so the rAF loop never triggers React re-renders.
  const frameF = useRef(0); // fractional frame position
  const dragging = useRef(false);
  const hovering = useRef(false);
  const velocity = useRef(0); // frames per tick, for inertia
  const lastPointerX = useRef(0);
  const rafId = useRef<number | null>(null);

  // Parallax tilt (spring-smoothed) — pure depth, independent of rotation.
  const tiltX = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });
  const tiltY = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });
  const rotateX = useTransform(tiltX, (v) => v);
  const rotateY = useTransform(tiltY, (v) => v);

  const applyFrame = useCallback(() => {
    if (!imgRef.current || count === 0) return;
    let idx = Math.round(frameF.current) % count;
    if (idx < 0) idx += count;
    const src = frames[idx];
    if (imgRef.current.getAttribute("src") !== src) {
      imgRef.current.setAttribute("src", src);
    }
  }, [frames, count]);

  // Preload every frame so src-swaps are instant (no cache-miss flicker).
  useEffect(() => {
    if (count === 0 || !inView) return;
    let loaded = 0;
    let cancelled = false;
    const imgs: HTMLImageElement[] = [];
    frames.forEach((src) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = img.onerror = () => {
        if (cancelled) return;
        loaded += 1;
        setLoadedPct(Math.round((loaded / count) * 100));
        if (loaded === count) {
          setReady(true);
          applyFrame();
        }
      };
      img.src = src;
      imgs.push(img);
    });
    return () => {
      cancelled = true;
      imgs.forEach((i) => (i.onload = i.onerror = null));
    };
  }, [frames, count, applyFrame, inView]);

  // Main animation loop: idle auto-spin + inertia decay.
  useEffect(() => {
    if (reduceMotion || count === 0) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 64) / 16.67; // normalised to ~60fps
      last = now;

      if (!dragging.current) {
        if (Math.abs(velocity.current) > 0.01) {
          // inertia after a flick
          frameF.current += velocity.current * dt;
          velocity.current *= 0.94;
        } else if (!hasInteracted && !hovering.current) {
          // gentle idle showcase spin, only before first interaction
          frameF.current += 0.14 * dt;
        }
        applyFrame();
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [reduceMotion, count, hasInteracted, applyFrame]);

  // ---- Pointer drag to rotate ----
  const onPointerDown = (e: React.PointerEvent) => {
    if (count === 0) return;
    dragging.current = true;
    velocity.current = 0;
    lastPointerX.current = e.clientX;
    setHasInteracted(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    // Parallax tilt tracks the pointer regardless of drag state.
    const el = containerRef.current;
    if (el && !reduceMotion) {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      tiltY.set(px * 14);
      tiltX.set(-py * 12);
    }
    if (!dragging.current) return;
    const dx = e.clientX - lastPointerX.current;
    lastPointerX.current = e.clientX;
    const delta = -dx / dragSensitivity; // drag right → spin forward
    frameF.current += delta;
    velocity.current = delta; // remember last delta for inertia
    applyFrame();
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
  };

  const onEnter = () => {
    hovering.current = true;
  };
  const onLeave = (e: React.PointerEvent) => {
    hovering.current = false;
    tiltX.set(0);
    tiltY.set(0);
    endDrag(e);
  };

  return (
    <div className={`relative select-none ${className}`}>
      {/* Ambient depth glow behind the object */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[85%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(168,124,54,0.20), rgba(168,124,54,0.08) 45%, transparent 70%)" }}
      />

      <motion.div
        ref={containerRef}
        role="img"
        aria-label={alt}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        className="relative z-10 aspect-square w-full cursor-grab touch-none active:cursor-grabbing"
        style={{ rotateX, rotateY, transformPerspective: 1200, transformStyle: "preserve-3d" }}
        animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
        transition={reduceMotion ? undefined : { duration: 6, ease: "easeInOut", repeat: Infinity }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={poster ?? frames[0]}
          alt={alt}
          draggable={false}
          className="h-full w-full object-contain"
          style={{ opacity: ready ? 1 : 0.85, transition: "opacity 400ms ease" }}
        />

        {/* Loading progress */}
        {!ready && (
          <div className="absolute inset-x-0 bottom-6 mx-auto flex w-40 flex-col items-center gap-2">
            <div className="h-[2px] w-full overflow-hidden rounded-full bg-pearl/10">
              <div className="h-full rounded-full bg-champagne transition-[width] duration-200" style={{ width: `${loadedPct}%` }} />
            </div>
            <span className="text-[0.6rem] uppercase tracking-[0.2em] text-ink/40">Loading view</span>
          </div>
        )}
      </motion.div>

      {/* Drag hint — fades once the user takes over */}
      {ready && !reduceMotion && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex justify-center transition-opacity duration-500"
          style={{ opacity: hasInteracted ? 0 : 1 }}
        >
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[0.62rem] uppercase tracking-[0.22em] text-ink/70">
            ◐ <span>Drag to rotate</span>
          </span>
        </div>
      )}
    </div>
  );
}

function DragIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="text-champagne">
      <path d="M8 9l-3 3 3 3M16 9l3 3-3 3M12 5v14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Shared scroll-progress state that bridges the DOM scroll (driven by GSAP
 * ScrollTrigger, synced to Lenis) into the R3F render loop.
 *
 * `target` is written by <ScrollDriver/> on every ScrollTrigger update (0 → 1
 * across the whole page). `current` is damped toward `target` inside the R3F
 * useFrame loop for buttery, frame-rate-independent camera motion.
 */
export const scrollState = { target: 0, current: 0, velocity: 0 };

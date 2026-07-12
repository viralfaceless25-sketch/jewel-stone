"use client";

import type { PointerEvent, ReactNode } from "react";
import Link from "next/link";
import { animated, useSpring } from "@react-spring/web";

export function MagneticCTA({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const [spring, api] = useSpring(() => ({ x: 0, y: 0, config: { tension: 260, friction: 18 } }));

  function move(event: PointerEvent<HTMLDivElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    api.start({ x: (event.clientX - bounds.left - bounds.width / 2) * .12, y: (event.clientY - bounds.top - bounds.height / 2) * .16 });
  }

  return (
    <animated.div style={spring} onPointerMove={move} onPointerLeave={() => api.start({ x: 0, y: 0 })}>
      <Link href={href} className={className}>{children}</Link>
    </animated.div>
  );
}

"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { animated, useSpring } from "@react-spring/web";
import { cn } from "@/lib/utils";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 active:scale-[0.97] select-none";

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "dark" | "gold";
  className?: string;
}) {
  return (
    <Magnetic><Link
      href={href}
      className={cn(
        base,
        variant === "primary" &&
          "bg-gradient-to-br from-aurora2 to-aurora1 text-ivory shadow-[0_8px_26px_rgba(180,132,47,0.4)] hover:brightness-110 hover:shadow-[0_10px_34px_rgba(180,132,47,0.48)]",
        variant === "secondary" &&
          "border border-rose/30 bg-marble/80 text-ink shadow-[inset_0_1px_0_rgba(237,241,246,0.6)] hover:border-rose/60 hover:bg-pearl",
        variant === "dark" &&
          "border border-champagne/35 bg-ivory/70 text-ink hover:bg-pearl/70",
        variant === "gold" &&
          "bg-gradient-to-br from-aurora2 to-aurora1 text-ivory shadow-[0_8px_26px_rgba(180,132,47,0.4)] hover:brightness-110 hover:shadow-[0_10px_34px_rgba(180,132,47,0.48)]",
        className
      )}
    >
      {children}
    </Link></Magnetic>
  );
}

export function ActionButton({
  children,
  onClick,
  variant = "primary",
  className,
  type = "button",
  disabled = false
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <Magnetic><button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        base,
        "disabled:cursor-not-allowed disabled:opacity-55",
        variant === "primary" &&
          "bg-gradient-to-br from-aurora2 to-aurora1 text-ivory shadow-[0_8px_26px_rgba(180,132,47,0.4)] hover:brightness-110 hover:shadow-[0_10px_34px_rgba(180,132,47,0.48)]",
        variant === "secondary" &&
          "border border-rose/30 bg-marble/80 text-ink shadow-[inset_0_1px_0_rgba(237,241,246,0.6)] hover:border-rose/60 hover:bg-pearl",
        className
      )}
    >
      {children}
    </button></Magnetic>
  );
}
function Magnetic({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [styles, api] = useSpring(() => ({ x: 0, y: 0, config: { mass: 0.55, tension: 360, friction: 22 } }));
  const move = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || event.pointerType === "touch") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    api.start({ x: (event.clientX - rect.left - rect.width / 2) * 0.18, y: (event.clientY - rect.top - rect.height / 2) * 0.18 });
  };
  return <animated.span ref={ref} onPointerMove={move} onPointerLeave={() => api.start({ x: 0, y: 0 })} style={styles} className={`inline-flex ${className}`}>{children}</animated.span>;
}

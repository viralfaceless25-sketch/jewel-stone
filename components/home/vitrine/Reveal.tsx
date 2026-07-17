"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import styles from "./vitrine.module.css";

type RevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  id?: string;
};

export function Reveal({ as: Tag = "section", children, className = "", id }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        Array.from(node.querySelectorAll<HTMLElement>("[data-reveal-item]")).forEach((item, index) => {
          item.animate(
            [{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "translateY(0)" }],
            { duration: 760, delay: index * 80, easing: "cubic-bezier(.22,1,.36,1)", fill: "none" },
          );
        });
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} id={id} className={`${styles.reveal} ${className}`}>
      {children}
    </Tag>
  );
}

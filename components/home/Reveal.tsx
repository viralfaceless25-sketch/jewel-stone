"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import styles from "./home.module.css";

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
    if (reduced.matches || !("IntersectionObserver" in window)) {
      node.dataset.visible = "true";
      return;
    }

    node.dataset.revealReady = "true";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        node.dataset.visible = "true";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
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

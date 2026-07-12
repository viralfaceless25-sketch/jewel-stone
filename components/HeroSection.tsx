"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ButtonLink } from "@/components/Buttons";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  ["11", "Signature SKUs"],
  ["GIA / IGI", "Certified"],
  ["Lifetime", "Service"],
] as const;

export function HeroSection() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      video.current?.pause();
      return;
    }
    const ctx = gsap.context(() => {
      gsap.from(".hero-reveal", { y: 34, opacity: 0, duration: .8, stagger: .08, ease: "power3.out" });
      gsap.to(video.current, {
        yPercent: 12,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative isolate flex min-h-[94dvh] overflow-hidden text-ink" aria-labelledby="home-hero-heading">
      <video ref={video} autoPlay muted loop playsInline poster="/videos/hero/collection-poster.jpg" aria-hidden className="absolute -inset-y-[12%] -z-10 h-[124%] w-full object-cover">
        <source src="/videos/hero/collection-loop.mp4" type="video/mp4" />
      </video>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(252,248,241,.96)_0%,rgba(252,248,241,.72)_48%,rgba(252,248,241,.16)_100%),linear-gradient(0deg,rgba(252,248,241,.92),transparent_55%)]" />

      <div className="luxury-shell relative z-10 flex w-full flex-col justify-end pb-8 pt-36 lg:pb-10">
        <div className="max-w-2xl">
          <p className="hero-reveal eyebrow">NYC Diamond District · Set by hand</p>
          <h2 id="home-hero-heading" className="hero-reveal chrome-text mt-5 font-display text-[clamp(3.25rem,7vw,6.5rem)] font-medium leading-[.86] tracking-[-.025em]">
            Diamonds,<br />made to wear.
          </h2>
          <p className="hero-reveal mt-7 max-w-xl text-base leading-8 text-ink/68">
            One-of-a-kind signature pieces photographed in-house, plus made-to-order lab-grown diamonds set by hand in the NYC Diamond District — GIA &amp; IGI certified, every time.
          </p>
          <div className="hero-reveal mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/collections" variant="gold">Explore collection</ButtonLink>
            <ButtonLink href="/contact" variant="dark">Book consultation</ButtonLink>
          </div>
        </div>

        <dl className="hero-reveal glass mt-14 grid overflow-hidden rounded-2xl sm:grid-cols-3">
          {STATS.map(([value, label], index) => (
            <div key={label} className={`px-6 py-5 ${index ? "border-t border-[var(--hair)] sm:border-l sm:border-t-0" : ""}`}>
              <dt className="font-display text-2xl text-[var(--chrome-hi)] tabular-nums">{value}</dt>
              <dd className="mt-1 text-[.62rem] uppercase tracking-[.2em] text-ink/45">{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

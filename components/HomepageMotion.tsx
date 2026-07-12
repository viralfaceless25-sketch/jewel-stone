"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function HomepageMotion() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set([".reveal", ".flex-letter", ".flex-fade"], { opacity: 1, y: 0, clearProps: "transform" });
        return;
      }

      gsap.utils.toArray<HTMLElement>(".reveal").forEach((element) => {
        gsap.fromTo(element, { opacity: 0, y: 44, scale: 0.975 }, {
          opacity: 1, y: 0, scale: 1, duration: 1.05, ease: "back.out(1.45)",
          scrollTrigger: { trigger: element, start: "top 88%", once: true },
        });
      });

      const hero = document.querySelector<HTMLElement>(".cinematic-hero");
      if (hero) {
        const heroTl = gsap.timeline({
          scrollTrigger: { trigger: hero, start: "top top", end: "+=85%", pin: true, scrub: 0.65, anticipatePin: 1 },
        });
        heroTl
          .to(".hero-wordmark", { yPercent: -12, scale: 0.94, filter: "hue-rotate(22deg)", ease: "none" }, 0)
          .to(".hero-diamond-aperture", { scale: 1.16, rotate: 18, opacity: 0.5, ease: "none" }, 0)
          .to(".hero-copy", { y: -28, opacity: 0.72, stagger: 0.06, ease: "none" }, 0.12)
          .to(".flex-fade.absolute", { opacity: 0, y: 12, ease: "none" }, 0.2);
      }

      ScrollTrigger.matchMedia({
        "(min-width: 1024px)": () => {
          const section = document.querySelector<HTMLElement>(".featured-pin");
          const track = document.querySelector<HTMLElement>(".featured-track");
          if (!section || !track) return;
          const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 80);
          gsap.to(track, {
            x: () => -distance(), ease: "none",
            scrollTrigger: { trigger: section, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 0.75, invalidateOnRefresh: true, anticipatePin: 1 },
          });
        },
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((layer) => {
        gsap.to(layer, { yPercent: Number(layer.dataset.parallax ?? -8), ease: "none", scrollTrigger: { trigger: layer, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
    const timer = window.setTimeout(() => ScrollTrigger.refresh(), 500);
    return () => { window.clearTimeout(timer); ctx.revert(); };
  }, []);
  return null;
}

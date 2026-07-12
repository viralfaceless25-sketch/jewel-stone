import Image from "next/image";
import Link from "next/link";

const TILES = [
  { kind: "lifestyle", src: "/images/lifestyle/model-asscher-editorial.jpg", alt: "Model wearing Jewel Stone Asscher drop earrings", label: "On the ear", className: "md:col-span-7 md:row-span-2" },
  { kind: "lifestyle", src: "/images/lifestyle/model-eternity-band-hand.jpg", alt: "Diamond eternity band worn on the hand", label: "In the hand", className: "md:col-span-5" },
  { kind: "product", src: "/images/products/heart-halo-ring/hero-render.jpg", alt: "Jewel Stone heart halo diamond ring", label: "The heart, framed", className: "md:col-span-5" },
  { kind: "placeholder", alt: "A future Jewel Stone editorial story", label: "From the bench · Coming soon", className: "md:col-span-12" },
] as const;

export function EditorialBento() {
  return (
    <section className="editorial-section bg-ivory" aria-labelledby="editorial-bento-heading">
      <div className="luxury-shell">
        <div className="reveal mb-10 flex items-end justify-between gap-6 border-b border-[var(--hair)] pb-5">
          <div>
            <p className="eyebrow">Worn in the light</p>
            <h2 id="editorial-bento-heading" className="mt-3 font-display text-[clamp(2.5rem,5vw,4.8rem)] leading-[.96]">The house, <em className="editorial-italic">in motion.</em></h2>
          </div>
          <span className="hidden text-[.62rem] uppercase tracking-[.22em] text-ink/65 md:block">New York · Issue 01</span>
        </div>
        <div className="grid gap-4 md:grid-cols-12 md:auto-rows-[18rem]">
          {TILES.map((tile, index) => (
            <figure key={`${tile.label}-${index}`} className={`reveal group relative min-h-[22rem] overflow-hidden border border-[var(--hair)] bg-[#141416] ${tile.kind === "product" ? "p-4" : ""} ${tile.className}`}>
              {tile.kind === "placeholder" ? (
                <div className="flex h-full min-h-[20rem] flex-col items-center justify-center bg-[radial-gradient(circle_at_48%_38%,#C7C2B8_0%,#8B877E_44%,#141416_100%)] px-6 text-center text-[#F2F0EB]">
                  <span aria-hidden className="font-display text-6xl text-[#F2F0EB] drop-shadow-[0_6px_24px_rgba(70,45,16,.28)]">◆</span>
                  <span className="mt-5 text-[.68rem] uppercase tracking-[.24em]">A new signature is taking shape</span>
                </div>
              ) : (
                <div className={`relative h-full min-h-[20rem] overflow-hidden ${tile.kind === "product" ? "bg-[radial-gradient(circle_at_50%_42%,#141416,#1D1D20)]" : "bg-[#1D1D20]"}`}>
                  <Image src={tile.src} alt={tile.alt} fill sizes="(min-width: 768px) 58vw, 94vw" className={`${tile.kind === "product" ? "object-contain p-8" : "object-cover"} transition-transform duration-700 group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none`} />
                  {tile.kind === "lifestyle" && <span className="absolute inset-0 bg-gradient-to-t from-[#F2F0EB]/45 via-transparent to-transparent" />}
                </div>
              )}
              <figcaption className={`absolute bottom-6 left-6 border px-4 py-2 text-[.6rem] uppercase tracking-[.22em] backdrop-blur ${tile.kind === "lifestyle" ? "border-white/35 bg-[#F2F0EB]/65 text-white" : "border-[#8B877E]/25 bg-ivory/92 text-[#F2F0EB]"}`}>{tile.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

const CATEGORIES = ["Rings", "Earrings", "Pendants", "Bracelets", "Necklaces", "Custom"] as const;

export function CategoryStrip() {
  return (
    <nav className="border-y border-[var(--hair)] bg-[#0A0A0B]" aria-label="Shop by category">
      <div className="luxury-shell grid grid-cols-2 md:grid-cols-6">
        {CATEGORIES.map((category, index) => (
          <Link key={category} href={category === "Custom" ? "/custom" : `/collections?category=${category.toLowerCase()}`} className={`group flex min-h-24 items-center justify-between px-5 font-display text-xl transition-colors hover:bg-white/50 md:min-h-32 md:flex-col md:justify-center md:text-2xl ${index ? "border-l border-[var(--hair)]" : ""} ${index > 1 ? "border-t border-[var(--hair)] md:border-t-0" : ""}`}>
            {category}<span className="text-xs text-champagne transition-transform group-hover:translate-x-1">↗</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

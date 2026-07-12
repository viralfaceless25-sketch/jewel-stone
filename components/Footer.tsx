import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Facebook, Instagram, Share2, Youtube } from "lucide-react";
import { brand } from "@/data/site";

const SHOP = [
  { label: "Engagement Rings", href: "/collections/rings" },
  { label: "Wedding Bands", href: "/collections/bands" },
  { label: "Diamond Studs", href: "/collections/earrings" },
  { label: "Necklaces", href: "/collections/necklaces" },
  { label: "Bracelets", href: "/collections/bracelets" },
  { label: "Loose Diamonds", href: "/diamonds" },
  { label: "Custom Design", href: "/custom" },
  { label: "My Wishlist", href: "/wishlist" }
];

const SERVICE = [
  { label: "Shipping Policy", href: "/pages/shipping" },
  { label: "Returns & Exchanges", href: "/pages/returns" },
  { label: "Warranty", href: "/pages/warranty" },
  { label: "FAQ", href: "/pages/faq" },
  { label: "Contact Us", href: "/contact" },
  { label: "Book Appointment", href: "/contact" }
];

const ABOUT_LINKS = [
  { label: "Our Story", href: "/about" },
  { label: "Sustainability", href: "/about#sustainability" },
  { label: "Press", href: "/about#press" },
  { label: "Careers", href: "/about#careers" },
  { label: "Education", href: "/education" }
];

const SOCIAL = [
  { label: "Instagram", href: "#", icon: Instagram },
  { label: "Facebook", href: "#", icon: Facebook },
  { label: "YouTube", href: "#", icon: Youtube },
  { label: "TikTok", href: "#", icon: Share2 }
];

function FooterColumn({ title, links }: { title: string; links: Array<{ href: string; label: string }> }) {
  return (
    <div>
      <p className="text-[0.6rem] font-medium uppercase tracking-[0.22em] text-champagne/50">{title}</p>
      <div className="mt-5 grid gap-2.5">
        {links.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="text-[0.85rem] text-ink/60 transition-colors duration-150 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative">
      {/* ── Dark atelier CTA band ── */}
      <div className="relative overflow-hidden bg-transparent py-14 lg:py-16">
        <div className="luxury-shell">
          <div className="flex flex-col items-center gap-6 rounded-3xl border border-champagne/20 bg-white/45 px-6 py-9 text-center shadow-[0_24px_70px_rgba(126,90,36,0.12)] backdrop-blur-md sm:px-10 lg:flex-row lg:justify-between lg:text-left">
            <div>
              <p className="eyebrow text-champagne/70">Stay in the loop</p>
              <h3 className="display-title mt-2 text-[clamp(1.6rem,3vw,2.2rem)] leading-tight text-ink">
                Private drops &amp; diamond education.
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-ink/60">
                Appointment openings and new signature pieces from the Diamond District, straight to your inbox.
              </p>
            </div>
            <form className="flex w-full max-w-sm shrink-0 overflow-hidden rounded-full border border-champagne/25 bg-ivory/70 shadow-[0_4px_20px_rgba(126,90,36,0.12)]">
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="Your email"
                className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Join newsletter"
                className="m-1 flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-br from-aurora2 to-aurora1 px-4 text-xs font-medium text-ivory shadow-glow transition-all duration-200 hover:brightness-110"
              >
                Join
                <ArrowRight size={13} aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Obsidian base ── */}
      <div className="relative overflow-hidden bg-[#141416] text-ink">
        <div className="pointer-events-none absolute inset-0 opacity-10 mix-blend-multiply" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/textures/footer-ambient-velvet.jpg"
            alt=""
            className="h-full w-full object-cover object-top"
          />
        </div>

        {/* Two zones: brand (left) + link columns (right) */}
        <div className="luxury-shell relative z-10 grid gap-x-10 gap-y-14 py-16 lg:grid-cols-[1.25fr_2fr]">
          {/* Brand zone */}
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose">
              <Image
                src="/logo-transparent.png"
                alt="Jewel Stone"
                width={56}
                height={56}
                className="h-11 w-auto"
                style={{ mixBlendMode: "multiply" }}
              />
              <div>
                <p className="font-display text-xl leading-none text-ink">{brand.name}</p>
                <p className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-champagne/55">
                  {brand.tagline}
                </p>
              </div>
            </Link>
            <p className="mt-5 text-xs leading-6 text-ink/45">
              Fine lab-grown diamond jewelry, certified loose diamonds, and custom design
              consultations from New York&apos;s Diamond District.
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-rose/60" />
                <span className="text-[0.62rem] uppercase tracking-[0.18em] text-ink/40">GIA · IGI Certified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-rose/60" />
                <span className="text-[0.62rem] uppercase tracking-[0.18em] text-ink/40">62 W 47th St · New York, NY</span>
              </div>
            </div>

            {/* Connect — social + contact, folded into the brand zone */}
            <div className="mt-8">
              <p className="text-[0.6rem] font-medium uppercase tracking-[0.22em] text-champagne/50">Connect</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {SOCIAL.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    aria-label={label}
                    className="grid size-9 place-items-center rounded-full border border-champagne/12 text-ink/50 transition-all duration-200 hover:border-rose/50 hover:text-ink hover:shadow-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose"
                  >
                    <Icon size={15} aria-hidden="true" />
                  </Link>
                ))}
              </div>
              <div className="mt-5 space-y-2 text-xs text-ink/50">
                <Link href={`tel:${brand.phone.replaceAll(" ", "")}`} className="block transition-colors hover:text-ink">
                  {brand.phone}
                </Link>
                <Link href={`mailto:${brand.email}`} className="block break-all transition-colors hover:text-ink">
                  {brand.email}
                </Link>
              </div>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
            <FooterColumn title="Shop" links={SHOP} />
            <FooterColumn title="Customer Service" links={SERVICE} />
            <FooterColumn title="About" links={ABOUT_LINKS} />
          </div>
        </div>

        {/* ── Oversized wordmark band (its own row — cannot collide with content) ── */}
        <div className="relative z-10 overflow-hidden border-t border-champagne/8">
          <div className="luxury-shell py-8">
            <p
              aria-hidden="true"
              className="chrome-text select-none whitespace-nowrap text-center font-display leading-none opacity-15"
              style={{ fontSize: "clamp(3rem, 13vw, 11rem)" }}
            >
              Jewel Stone
            </p>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="relative z-10 border-t border-champagne/8">
          <div className="luxury-shell flex flex-col gap-4 py-6 text-[0.65rem] text-ink/30 sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 Jewel Stone NY LLC. All rights reserved.</span>
            <div className="flex flex-wrap items-center gap-3">
              {["VISA", "MC", "AMEX", "PAYPAL", "AFFIRM"].map((payment) => (
                <span
                  key={payment}
                  className="rounded border border-champagne/12 px-2 py-0.5 text-[0.58rem] font-medium uppercase tracking-[0.08em] text-ink/35"
                >
                  {payment}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

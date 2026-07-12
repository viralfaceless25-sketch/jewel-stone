"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { megaNav } from "@/data/site";
import { useInquiryStore } from "@/store/inquiry";
import { useWishlistStore } from "@/store/wishlist";
import { cn } from "@/lib/utils";

export function LuxuryNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const count = useInquiryStore((state) => state.items.length);
  const inquiryItems = useInquiryStore((state) => state.items);
  const removeInquiryItem = useInquiryStore((state) => state.removeItem);
  const wishlistCount = useWishlistStore((state) => state.items.length);

  const activeItem = megaNav.find((item) => item.label === activeMenu);
  const hasMegaMenu = !!(activeItem?.groups?.length);

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function queueClose() {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setActiveMenu(null), 120);
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 pointer-events-none">

        {/* ── Nav pill ── */}
        <div className="flex justify-center px-4 pt-10">
          <nav
            className="nav-pill pointer-events-auto flex items-center gap-0.5 rounded-full px-2 py-1.5"
            aria-label="Main navigation"
            onMouseEnter={clearCloseTimer}
            onMouseLeave={queueClose}
          >
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors duration-200 hover:bg-pearl/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Image
                src="/logo-transparent.png"
                alt="Jewel Stone"
                width={120}
                height={120}
                className="h-9 w-auto"
                style={{ filter: "grayscale(1) brightness(2.4)" }}
                priority
              />
              <span className="font-display text-[1.12rem] leading-none tracking-[-0.01em] text-ink">Jewel Stone</span>
            </Link>

            <span className="mx-1 hidden h-4 w-px bg-champagne/20 lg:block" aria-hidden="true" />

            {/* Desktop links */}
            <div className="hidden items-center lg:flex">
              {megaNav.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const hasDropdown = !!(item.groups?.length || item.children?.length);

                if (!hasDropdown) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onMouseEnter={() => setActiveMenu(null)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-[0.78rem] transition-all duration-200 hover:bg-pearl/10 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                        isActive ? "bg-pearl/10 font-medium text-champagne" : "text-ink/70"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setActiveMenu(activeMenu === item.label ? null : item.label)}
                    onMouseEnter={() => { clearCloseTimer(); setActiveMenu(item.label); }}
                    onFocus={() => setActiveMenu(item.label)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[0.78rem] transition-all duration-200 hover:bg-pearl/10 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                      isActive || activeMenu === item.label ? "bg-pearl/10 font-medium text-champagne" : "text-ink/70"
                    )}
                    aria-expanded={activeMenu === item.label}
                    aria-haspopup="true"
                  >
                    {item.label}
                    <ChevronDown
                      size={12}
                      className={cn("transition-transform duration-200", activeMenu === item.label && "rotate-180")}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>

            <span className="mx-1 hidden h-4 w-px bg-champagne/20 lg:block" aria-hidden="true" />

            {/* Actions */}
            <div className="flex items-center gap-0.5">
              <Link
                href="/diamonds"
                className="grid size-9 place-items-center rounded-full text-ink/75 transition-all duration-200 hover:bg-pearl/10 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                aria-label="Search diamonds"
              >
                <Search size={15} aria-hidden="true" />
              </Link>
              <Link
                href="/wishlist"
                className="relative grid size-9 place-items-center rounded-full text-ink/75 transition-all duration-200 hover:bg-pearl/10 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                aria-label={`Wishlist${wishlistCount > 0 ? ` — ${wishlistCount}` : ""}`}
              >
                <Heart size={15} aria-hidden="true" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-signal text-[0.6rem] font-medium text-ink">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="relative grid size-9 place-items-center rounded-full text-ink/75 transition-all duration-200 hover:bg-pearl/10 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                aria-label={`Inquiry${count > 0 ? ` — ${count}` : ""}`}
              >
                <ShoppingBag size={16} aria-hidden="true" />
                {count > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-signal text-[0.6rem] font-medium text-ink">
                    {count}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="grid size-9 place-items-center rounded-full text-ink/75 transition-all duration-200 hover:bg-pearl/10 hover:text-ink lg:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
              >
                {open ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
              </button>
            </div>
          </nav>
        </div>

        {/* ── Mega menu ── full-width panel */}
        {/* Single persistent panel — no key on the outer div so switching items
            never triggers exit+enter. Only open/close animates. */}
        <AnimatePresence>
          {hasMegaMenu && activeItem && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
              className="pointer-events-auto mt-2.5 w-full border-t border-rose/10 bg-pearl/[0.97] shadow-[0_20px_60px_rgba(12,14,16,0.10)] backdrop-blur-2xl"
              onMouseEnter={clearCloseTimer}
              onMouseLeave={queueClose}
            >
              <div className="mx-auto max-w-6xl px-10 py-9">
                <div className="flex items-start gap-10">

                  {/* ── Column groups — plain divs, swap instantly on item switch ── */}
                  <div className="flex flex-1 flex-wrap gap-x-12 gap-y-8">
                    {activeItem.groups!.map((group) => (
                      <div key={group.title} className="min-w-[130px]">
                        <p className="mb-3.5 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-velvet/50">
                          {group.title}
                        </p>
                        <div className="mb-4 h-px w-8 bg-rose/30" />
                        <ul className="space-y-2.5">
                          {group.items.map((child) => (
                            <li key={child.label}>
                              <Link
                                href={child.href}
                                onClick={() => setActiveMenu(null)}
                                className="group/item flex items-center gap-1.5 text-[0.82rem] text-ink/60 transition-all duration-150 hover:text-velvet"
                              >
                                <span className="h-px w-0 bg-rose/60 transition-all duration-200 group-hover/item:w-3" />
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    {/* Wide VIEW ALL bar */}
                    {activeItem.viewAll && (
                      <div className="w-full">
                        <Link
                          href={activeItem.viewAll}
                          onClick={() => setActiveMenu(null)}
                          className="group/all flex w-full items-center justify-center gap-2 border border-ink/12 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink/40 transition-all duration-200 hover:border-velvet/25 hover:bg-rose/[0.04] hover:text-velvet"
                        >
                          View All {activeItem.label}
                          <span className="inline-block translate-x-0 transition-transform duration-200 group-hover/all:translate-x-1">→</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* ── Featured editorial panel ── */}
                  {activeItem.featured && (
                    <div className="w-[260px] flex-shrink-0">
                      <div className="group/feat relative overflow-hidden rounded-xl">
                        <Image
                          src={activeItem.featured.image}
                          alt={activeItem.featured.title}
                          width={260}
                          height={200}
                          className="h-[200px] w-full object-cover transition-transform duration-700 ease-out group-hover/feat:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-velvet/60 to-transparent" />
                        <p className="absolute bottom-3 left-4 font-display text-[1.05rem] leading-tight text-chromehi/95">
                          {activeItem.featured.title}
                        </p>
                      </div>

                      {activeItem.featured.subtitle && (
                        <p className="mt-2.5 text-[0.73rem] leading-relaxed text-ink/45">
                          {activeItem.featured.subtitle}
                        </p>
                      )}

                      <Link
                        href={activeItem.featured.href}
                        onClick={() => setActiveMenu(null)}
                        className="mt-3 flex items-center justify-center gap-1.5 bg-rose px-5 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink/90 transition-all duration-200 hover:bg-rose/85 active:scale-[0.98]"
                      >
                        {activeItem.featured.cta}
                      </Link>

                      <Link
                        href={activeItem.href}
                        onClick={() => setActiveMenu(null)}
                        className="mt-2 block text-center text-[0.65rem] text-ink/38 underline underline-offset-2 transition-colors hover:text-velvet/70"
                      >
                        Browse all {activeItem.label.toLowerCase()}
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-rose/25 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close inquiry drawer"
              className="fixed inset-0 z-[70] cursor-default bg-black/65 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
            />
            <motion.aside
              aria-label="Inquiry selection"
              className="fixed bottom-3 right-3 top-3 z-[71] flex w-[min(28rem,calc(100%-1.5rem))] flex-col overflow-hidden rounded-[26px] border border-hair2 bg-pearl shadow-glow"
              initial={{ x: "105%" }}
              animate={{ x: 0 }}
              exit={{ x: "105%" }}
              transition={{ duration: .42, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="flex items-center justify-between border-b border-hair px-6 py-5">
                <div><p className="eyebrow">Private selection</p><h2 className="mt-1 font-display text-2xl font-bold">inquiry bag.</h2></div>
                <button type="button" onClick={() => setCartOpen(false)} className="grid size-10 place-items-center rounded-full border border-hair text-ink/70 hover:text-ink" aria-label="Close"><X size={17} /></button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                {inquiryItems.length === 0 ? (
                  <div className="grid h-full place-items-center text-center"><div><p className="font-display text-3xl font-bold">your edit is empty.</p><p className="mt-3 text-sm text-ink/55">Add a piece to request private availability.</p></div></div>
                ) : inquiryItems.map((item) => (
                  <article key={item.id} className="grid grid-cols-[76px_1fr_auto] gap-4 border-b border-hair py-4">
                    <Image src={item.image} alt={item.name} width={76} height={92} className="h-[92px] w-[76px] rounded-xl bg-marble object-contain p-2 grayscale" />
                    <div><Link href={`/products/${item.slug}`} onClick={() => setCartOpen(false)} className="font-display text-lg font-semibold leading-tight">{item.name}</Link><p className="mt-2 text-xs text-champagne">{item.priceLabel}</p></div>
                    <button type="button" onClick={() => removeInquiryItem(item.id)} className="grid size-8 place-items-center rounded-full border border-hair text-ink/50 hover:text-ink" aria-label={`Remove ${item.name}`}><X size={13} /></button>
                  </article>
                ))}
              </div>
              <div className="border-t border-hair p-5">
                <Link href="/inquiry" onClick={() => setCartOpen(false)} className="flex min-h-12 items-center justify-center rounded-full bg-champagne px-6 text-xs font-semibold uppercase tracking-[.16em] text-espresso">Prepare private inquiry</Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile menu overlay ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-x-4 top-[4.5rem] z-40 rounded-2xl border border-rose/18 bg-ivory/95 p-3 shadow-[0_16px_60px_rgba(12,14,16,0.14)] backdrop-blur-2xl lg:hidden"
          >
            <nav className="grid gap-0.5">
              {megaNav.map((item, i) => {
                const allChildren = item.groups
                  ? item.groups.flatMap((g) => g.items)
                  : item.children ?? [];
                const hasChildren = allChildren.length > 0;

                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                  >
                    {hasChildren ? (
                      <div>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "block rounded-xl px-4 py-3 text-sm transition-colors duration-150",
                            pathname.startsWith(item.href)
                              ? "bg-rose/10 font-medium text-velvet"
                              : "text-ink/75 hover:bg-rose/6"
                          )}
                        >
                          {item.label}
                        </Link>
                        <div className="grid gap-1 pb-2 pl-4 pt-1">
                          {allChildren.slice(0, 6).map((child) => (
                            <Link
                              key={`${item.label}-${child.label}`}
                              href={child.href}
                              onClick={() => setOpen(false)}
                              className={cn(
                                "rounded-lg px-4 py-2 text-sm text-ink/62 transition-colors hover:bg-rose/6 hover:text-ink",
                                pathname === child.href && "font-medium text-velvet"
                              )}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "block rounded-xl px-4 py-3 text-sm transition-colors duration-150",
                          pathname === item.href
                            ? "bg-rose/10 font-medium text-velvet"
                            : "text-ink/75 hover:bg-rose/6"
                        )}
                      >
                        {item.label}
                      </Link>
                    )}
                  </motion.div>
                );
              })}
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="mt-1 block rounded-xl bg-rose px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-rose/85"
              >
                Contact
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

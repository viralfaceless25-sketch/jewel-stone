"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { megaNav } from "@/data/site";
import { cartCount, useCartStore } from "@/store/cart";
import styles from "./site-chrome.module.css";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false); // mobile
  const [active, setActive] = useState<number | null>(null); // mega index
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? cartCount(items) : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const enter = (i: number) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (megaNav[i].groups) setActive(i);
    else setActive(null);
  };
  const leave = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActive(null), 120);
  };

  const activeItem = active !== null ? megaNav[active] : null;

  const onHeaderKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      setActive(null);
      setOpen(false);
    }
  };

  return (
    <header
      className={`${styles.nav} ${scrolled || active !== null ? styles.navScrolled : ""}`}
      onMouseLeave={leave}
      onKeyDown={onHeaderKeyDown}
    >
      <div className={styles.navInner}>
        <button
          className={styles.burger}
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>

        <nav className={styles.navLeft} aria-label="Primary">
          {megaNav.map((item, i) => (
            <div key={item.label} className={styles.navItem} onMouseEnter={() => enter(i)}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${active === i ? styles.navLinkActive : ""}`}
                aria-haspopup={item.groups ? "true" : undefined}
                aria-expanded={active === i}
                onFocus={() => enter(i)}
              >
                {item.label}
                {item.groups ? <i className={styles.caret} aria-hidden /> : null}
              </Link>
            </div>
          ))}
        </nav>

        <Link href="/" className={styles.wordmark} aria-label="Jewel Stone home">
          <Image className={styles.navMark} src="/brand/jewel-stone-mark.webp" alt="" width={34} height={42} />
          <Image className={styles.navWordmark} src="/brand/jewel-stone-nav-wordmark.webp" alt="Jewel Stone" width={166} height={23} priority />
        </Link>

        <div className={styles.navRight}>
          <Link href="/diamonds" className={styles.iconBtn} aria-label="Search diamonds">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.2-3.2" strokeLinecap="round" />
            </svg>
          </Link>
          <Link href="/wishlist" className={styles.iconBtn} aria-label="Wishlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.5 12 20 12 20Z" strokeLinejoin="round" />
            </svg>
          </Link>
          <button onClick={openCart} className={styles.bagBtn} aria-label={`Bag, ${count} items`}>
            Bag
            {count > 0 ? <span className={styles.bagCount}>{count}</span> : null}
          </button>
        </div>
      </div>

      {/* ── Mega panel ── */}
      <div
        className={`${styles.mega} ${activeItem?.groups ? styles.megaOpen : ""}`}
        onMouseEnter={() => active !== null && enter(active)}
        onMouseLeave={leave}
      >
        {activeItem?.groups ? (
          <div className={styles.megaInner}>
            <div className={styles.megaGroups}>
              {activeItem.groups.map((group) => (
                <div key={group.title} className={styles.megaGroup}>
                  <h4>{group.title}</h4>
                  <ul>
                    {group.items.map((link, idx) => (
                      <li key={`${link.label}-${idx}`}>
                        <Link href={link.href} onClick={() => setActive(null)}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {activeItem.viewAll ? (
                <Link className={styles.megaViewAll} href={activeItem.viewAll} onClick={() => setActive(null)}>
                  View all {activeItem.label}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              ) : null}
            </div>
            {activeItem.featured ? (
              <Link
                href={activeItem.featured.href}
                className={styles.megaFeatured}
                onClick={() => setActive(null)}
              >
                <Image
                  src={activeItem.featured.image}
                  alt={activeItem.featured.title}
                  fill
                  sizes="320px"
                  className={styles.megaFeaturedImg}
                />
                <div className={styles.megaFeaturedBody}>
                  {activeItem.featured.subtitle ? <span>{activeItem.featured.subtitle}</span> : null}
                  <strong>{activeItem.featured.title}</strong>
                  <em>{activeItem.featured.cta} →</em>
                </div>
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* ── Mobile menu ── */}
      {open && (
        <nav id="mobile-navigation" className={styles.mobileMenu} aria-label="Mobile">
          {megaNav.map((item) => (
            <Link key={item.label} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
        </nav>
      )}
    </header>
  );
}

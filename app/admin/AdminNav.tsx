"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Boxes,
  CircleDollarSign,
  Clock,
  Gem,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  Settings,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import styles from "./admin.module.css";

const links = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/inventory", label: "Inventory", Icon: Boxes },
  { href: "/admin/diamonds", label: "Loose diamonds", Icon: Gem },
  { href: "/admin/orders", label: "Orders", Icon: ReceiptText },
  { href: "/admin/customers", label: "Customers", Icon: Users },
  { href: "/admin/kyc", label: "KYC", Icon: ShieldCheck },
  { href: "/admin/inbox", label: "Inbox", Icon: Inbox },
  { href: "/admin/invoices", label: "Invoices & memos", Icon: FileText },
  { href: "/admin/open", label: "Open items", Icon: Clock },
  { href: "/admin/promotions", label: "Promotions", Icon: Ticket },
  { href: "/admin/operations", label: "Operations", Icon: CircleDollarSign },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
] as const;

export function AdminNav() {
  const pathname = usePathname() ?? "/admin";
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    const active = activeRef.current;
    if (!nav || !active || window.matchMedia("(min-width: 901px)").matches) return;
    const frame = window.requestAnimationFrame(() => {
      const navBox = nav.getBoundingClientRect();
      const activeBox = active.getBoundingClientRect();
      nav.scrollTo({
        left:
          nav.scrollLeft +
          activeBox.left -
          navBox.left -
          (nav.clientWidth - active.clientWidth) / 2,
        behavior: "smooth",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  async function signOut() {
    if (busy) return;
    setBusy(true);
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <aside className={styles.sidebar}>
      <Link href="/admin" className={styles.brand}>
        <span className={styles.brandMark}>Jewel Stone</span>
        <span className={styles.brandSub}>Owner panel</span>
      </Link>
      <nav ref={navRef} className={styles.nav} aria-label="Admin sections">
        {links.map(({ href, label, Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              ref={active ? activeRef : undefined}
              href={href}
              className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className={styles.navIcon} strokeWidth={1.7} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className={styles.sidebarFoot}>
        <Link className={styles.viewSite} href="/" target="_blank">View website ↗</Link>
        <button className={`${styles.btn} ${styles.btnSmall}`} type="button" onClick={signOut} disabled={busy}>
          <LogOut className={styles.navIcon} strokeWidth={1.7} aria-hidden />
          {busy ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}

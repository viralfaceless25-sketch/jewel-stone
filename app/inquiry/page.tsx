import type { Metadata } from "next";
import Link from "next/link";
import { EnquiryForm } from "@/components/pages/EnquiryForm";
import pages from "@/components/pages/pages.module.css";

export const metadata: Metadata = {
  title: "Private Inquiry",
  description:
    "Enquire privately about a Jewel Stone piece, a specific diamond, or a bespoke commission in NYC's Diamond District.",
  alternates: { canonical: "/inquiry" },
};

export default function InquiryPage() {
  return (
    <main className={pages.page}>
      <section className={pages.hero}>
        <p className={pages.eyebrow}><span /> Private inquiry</p>
        <h1 className={pages.h1}>Ask us <em>anything.</em></h1>
        <p className={pages.lede}>
          Considering a specific piece, hunting a particular stone, or planning a
          surprise? Send a private note and we&apos;ll reply personally.
        </p>
      </section>

      <section className={pages.section}>
        <div className={pages.narrow}>
          <EnquiryForm context="Private inquiry" />
          <p style={{ textAlign: "center", marginTop: "1.5rem", color: "var(--js-platinum)", fontSize: "0.85rem" }}>
            Ready to reserve instead? <Link href="/collections" style={{ color: "var(--js-gold-deep)", textDecoration: "underline", textUnderlineOffset: "3px" }}>Browse the vitrine →</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

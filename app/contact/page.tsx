import type { Metadata } from "next";
import { brand } from "@/data/site";
import { EnquiryForm } from "@/components/pages/EnquiryForm";
import pages from "@/components/pages/pages.module.css";

export const metadata: Metadata = {
  title: "Contact & Private Viewings",
  description:
    "Contact Jewel Stone in NYC's Diamond District. Book a private viewing, ask about a piece, or start a custom design.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage({ searchParams }: { searchParams?: { brief?: string } }) {
  return (
    <main className={pages.page}>
      <section className={pages.hero}>
        <p className={pages.eyebrow}><span /> Say hello</p>
        <h1 className={pages.h1}>Book a <em>private viewing.</em></h1>
        <p className={pages.lede}>
          By appointment in the Diamond District, or remotely from anywhere. Tell us
          what you&apos;re looking for and we&apos;ll bring the stones to you.
        </p>
      </section>

      <section className={pages.section}>
        <div className={`${pages.wrap} ${pages.split}`} style={{ alignItems: "start" }}>
          <div>
            <h2 className={pages.h2}>Reach us directly</h2>
            <dl style={{ display: "grid", gap: "1.4rem", margin: "1.5rem 0 0" }}>
              <div>
                <dt style={{ fontSize: ".72rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--js-platinum)" }}>Showroom</dt>
                <dd style={{ margin: ".3rem 0 0", fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>{brand.address}</dd>
              </div>
              <div>
                <dt style={{ fontSize: ".72rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--js-platinum)" }}>Phone</dt>
                <dd style={{ margin: ".3rem 0 0" }}><a href={`tel:${brand.phone.replace(/[^+\d]/g, "")}`} style={{ display: "inline-flex", alignItems: "center", minHeight: 32, color: "var(--js-gold-deep)", textDecoration: "none", fontSize: "1.1rem", fontFamily: "var(--font-display)" }}>{brand.phone}</a></dd>
              </div>
              <div>
                <dt style={{ fontSize: ".72rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--js-platinum)" }}>Email</dt>
                <dd style={{ margin: ".3rem 0 0" }}><a href={`mailto:${brand.email}`} style={{ display: "inline-flex", alignItems: "center", minHeight: 32, color: "var(--js-gold-deep)", textDecoration: "none", fontSize: "1.1rem", fontFamily: "var(--font-display)" }}>{brand.email}</a></dd>
              </div>
              <div>
                <dt style={{ fontSize: ".72rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--js-platinum)" }}>Hours</dt>
                <dd style={{ margin: ".3rem 0 0", fontSize: "1.1rem", fontFamily: "var(--font-display)" }}>{brand.hours}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h2 className={pages.h2}>Send a message</h2>
            <div style={{ marginTop: "1.5rem" }}>
            <EnquiryForm context={searchParams?.brief ? "Custom design brief" : "Contact page"} initialMessage={searchParams?.brief ?? ""} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import { brand } from "@/data/site";
import { AppointmentForm } from "@/components/pages/AppointmentForm";
import pages from "@/components/pages/pages.module.css";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description:
    "Book a private appointment with Jewel Stone in NYC's Diamond District. Choose a date and time and we'll confirm with you directly.",
  alternates: { canonical: "/appointment" },
};

export default function AppointmentPage() {
  return (
    <main className={pages.page}>
      <section className={pages.hero}>
        <p className={pages.eyebrow}><span /> Private appointment</p>
        <h1 className={pages.h1}>Book a <em>viewing.</em></h1>
        <p className={pages.lede}>
          Choose a date and time and tell us what you&apos;d like to see. Ishan confirms every
          appointment personally — in the Diamond District or remotely from anywhere.
        </p>
      </section>

      <section className={pages.section}>
        <div className={`${pages.wrap} ${pages.split}`} style={{ alignItems: "start" }}>
          <div>
            <h2 className={pages.h2}>The studio</h2>
            <dl style={{ display: "grid", gap: "1.4rem", margin: "1.5rem 0 0" }}>
              <div>
                <dt style={{ fontSize: ".72rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--js-platinum)" }}>Address</dt>
                <dd style={{ margin: ".3rem 0 0", fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>{brand.address}</dd>
              </div>
              <div>
                <dt style={{ fontSize: ".72rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--js-platinum)" }}>Phone</dt>
                <dd style={{ margin: ".3rem 0 0" }}><a href={`tel:${brand.phone.replace(/[^+\d]/g, "")}`} style={{ display: "inline-flex", alignItems: "center", minHeight: 32, color: "var(--js-gold-deep)", textDecoration: "none", fontSize: "1.1rem", fontFamily: "var(--font-display)" }}>{brand.phone}</a></dd>
              </div>
              <div>
                <dt style={{ fontSize: ".72rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--js-platinum)" }}>Hours</dt>
                <dd style={{ margin: ".3rem 0 0", fontSize: "1.1rem", fontFamily: "var(--font-display)" }}>{brand.hours}</dd>
              </div>
              <div>
                <dt style={{ fontSize: ".72rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--js-platinum)" }}>Host</dt>
                <dd style={{ margin: ".3rem 0 0", fontSize: "1.1rem", fontFamily: "var(--font-display)" }}>{brand.owner} · {brand.title}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h2 className={pages.h2}>Request a time</h2>
            <div style={{ marginTop: "1.5rem" }}>
              <AppointmentForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

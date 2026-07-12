import type { Metadata } from "next";
import { CustomBuilder } from "@/components/custom/CustomBuilder";
import pages from "@/components/pages/pages.module.css";

export const metadata: Metadata = {
  title: "Custom Design — Build Your Piece",
  description:
    "Design a one-of-a-kind piece with Jewel Stone. Choose your metal, stone shape, and budget — we source the diamond and craft it in NYC's Diamond District.",
  alternates: { canonical: "/custom" },
};

export default function CustomPage() {
  return (
    <main className={pages.page}>
      <section className={pages.hero}>
        <p className={pages.eyebrow}><span /> Bespoke</p>
        <h1 className={pages.h1}>Design <em>the one.</em></h1>
        <p className={pages.lede}>
          From a loose stone up. Answer five quick questions and our Diamond District
          team returns stone options and a sketch within a day — no obligation.
        </p>
      </section>

      <CustomBuilder />
    </main>
  );
}

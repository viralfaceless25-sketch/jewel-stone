import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CustomBuilder } from "@/components/custom/CustomBuilder";
import pages from "@/components/pages/pages.module.css";

export const metadata: Metadata = {
  title: "Custom Design — Build Your Piece",
  description:
    "Design a one-of-a-kind piece with Jewel Stone. Choose your metal, stone shape, and budget — we source the diamond and craft the piece in-house.",
  alternates: { canonical: "/custom" },
};

export default function CustomPage() {
  return (
    <main className={pages.page}>
      <section className={pages.hero}>
        <p className={pages.eyebrow}><span /> Bespoke</p>
        <h1 className={pages.h1}>Design <em>the one.</em></h1>
        <p className={pages.lede}>
          From a loose stone up. Answer five quick questions and our team
          returns stone options and a sketch within a day — no obligation.
        </p>
      </section>

      <section className={pages.section}>
        <div className={`${pages.wrap} ${pages.split}`}>
          <div className={pages.mediaFrame}>
            <Image src="/images/new/custom-design-editorial.jpg" alt="Custom jewelry concepts arranged for an atelier design review" fill sizes="(max-width:860px) 92vw, 46vw" className={pages.mediaCover} />
          </div>
          <div>
            <p className={pages.eyebrow}><span /> The in-house process</p>
            <h2 className={pages.h2}>A private commission, resolved in detail.</h2>
            <p className={pages.p}>We begin with wear: who it is for, how it should feel, and what must make it unmistakably theirs. Stone, scale, metal, and setting follow.</p>
            <p className={pages.p}>CAD establishes proportion and construction before casting. At the bench, stones are set, surfaces finished, and every angle inspected by hand.</p>
            <div className={pages.actions}><Link href="/contact" className={pages.btnGhost}>Speak with us first</Link></div>
          </div>
        </div>
      </section>

      <CustomBuilder />

      <section className={pages.dark}>
        <div className={pages.wrap} style={{ paddingBlock: "clamp(4rem,8vw,7rem)" }}>
          <p className={pages.eyebrow}><span /> From brief to heirloom</p>
          <h2 className={pages.h2}>Five decisions. One resolved piece.</h2>
          <div className={pages.cards} style={{ marginTop: "2.5rem" }}>
            {[
              ["01", "Stone", "Natural, lab-grown, inherited, or sourced for the commission."],
              ["02", "Architecture", "Sketch and CAD resolve scale, balance, profile, and security."],
              ["03", "Bench", "Casting, setting, polishing, inspection, and final fit remain in-house."],
            ].map(([num, title, body]) => <div className={pages.card} key={num} style={{ borderColor: "rgba(255,255,255,.25)" }}><div className={pages.num}>{num}</div><h3 className={pages.h3} style={{ color: "#fff" }}>{title}</h3><p style={{ margin:0, color:"rgba(255,255,255,.72)", lineHeight:1.7 }}>{body}</p></div>)}
          </div>
        </div>
      </section>
    </main>
  );
}

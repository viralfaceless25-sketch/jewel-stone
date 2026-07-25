import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CustomBuilder } from "@/components/custom/CustomBuilder";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqPageSchema, type FaqItem } from "@/lib/seo/schema";
import pages from "@/components/pages/pages.module.css";

export const metadata: Metadata = {
  title: "Custom Jewelry Design NYC — Request a Private Quotation",
  description:
    "Request custom jewelry from Jewel Stone in NYC. Upload reference images or a link, choose metal and diamond direction, then receive a private estimated quotation.",
  alternates: { canonical: "/custom" },
};

const CUSTOM_FAQS: FaqItem[] = [
  {
    question: "How do I request a custom jewelry design?",
    answer: "Upload one to six reference images, attach a public reference link, or do both, then choose the piece type, metal, stone shape, diamond origin, and budget before sending contact details.",
  },
  {
    question: "When will I receive a custom jewelry price?",
    answer: "The owner reviews the design reference and brief before sending a private estimated price or range, expected production time, and any design assumptions through the request status page.",
  },
  {
    question: "Can I accept or decline a custom jewelry quotation online?",
    answer: "Yes. The private request page lets the customer accept the quotation or decline it and request a revision. Acceptance confirms the estimate but does not automatically charge a card.",
  },
  {
    question: "How is a custom piece tracked after approval?",
    answer: "After final specifications and payment arrangements are confirmed, the owner marks the piece in production. When finished, the customer’s private status page shows the carrier, tracking number, and tracking link.",
  },
];

export default function CustomPage() {
  return (
    <main className={pages.page}>
      <section className={pages.hero}>
        <p className={pages.eyebrow}><span /> Bespoke</p>
        <h1 className={pages.h1}>Design <em>the one.</em></h1>
        <p className={pages.lede}>
          Upload a reference or attach its link, then answer five quick questions.
          Owner reviews the brief and sends a private estimated quotation for you to accept or decline.
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

      <section className={pages.section} aria-labelledby="custom-ar-title">
        <div className={`${pages.wrap} ${pages.split}`}>
          <div>
            <p className={pages.eyebrow}><span /> Virtual try-on · 3D &amp; AR</p>
            <h2 id="custom-ar-title" className={pages.h2}>See it on you, before it&apos;s made.</h2>
            <p className={pages.p}>
              Open the virtual try-on and place a PIECUT piece live on your own hand, ears, or
              neckline with your camera — or rotate and zoom it in 3D. A real preview of scale
              and proportion before a single stone is set.
            </p>
            <p className={pages.p}>
              Camera try-on is a beta and stays on your device — nothing is recorded. Final fit
              is always confirmed at a studio fitting.
            </p>
            <div className={pages.actions}>
              <Link href="/try-on" className={pages.btnPrimary}>Open virtual try-on</Link>
            </div>
          </div>
          <div className={pages.mediaFrame}>
            <Image
              src="/images/products/sr1-round-1ct-solitaire-ring/model.webp"
              alt="Round solitaire ring worn on the hand, shown at true scale"
              fill
              sizes="(max-width:860px) 92vw, 46vw"
              className={pages.mediaCover}
            />
          </div>
        </div>
      </section>

      <section className={pages.section} aria-labelledby="custom-makers-title">
        <div className={pages.wrap}>
          <p className={pages.eyebrow}><span /> The hands behind it</p>
          <h2 id="custom-makers-title" className={pages.h2}>Two makers, one bench.</h2>
          <p className={pages.p} style={{ maxWidth: "56ch" }}>
            Your commission never leaves the family workshop. From rough and cutting through
            casting, setting, and final polish, every Jewel Stone piece is built end to end
            under one roof — by two master craftsmen who have spent their working lives at the
            bench.
          </p>
          <div className={pages.cards} style={{ marginTop: "2.5rem" }}>
            <article className={pages.card}>
              <p style={{ fontSize: ".72rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--js-platinum)", margin: 0 }}>Build &amp; casting</p>
              <h3 className={pages.h3} style={{ marginTop: ".5rem" }}>Prakash Vaghani</h3>
              <p className={pages.p} style={{ margin: ".6rem 0 0" }}>
                Prakash oversees manufacturing from the first cut. He reads a stone before it
                is set — how it will hold light, where the metal must carry weight — and turns
                a CAD file into a piece with real presence in the hand.
              </p>
            </article>
            <article className={pages.card}>
              <p style={{ fontSize: ".72rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--js-platinum)", margin: 0 }}>Setting &amp; finish</p>
              <h3 className={pages.h3} style={{ marginTop: ".5rem" }}>Mitul Shihora</h3>
              <p className={pages.p} style={{ margin: ".6rem 0 0" }}>
                Mitul is responsible for the details you feel more than see — every prong
                seated true, every surface finished clean, every angle inspected by hand before
                a piece is allowed to leave the workshop.
              </p>
            </article>
          </div>
        </div>
      </section>

      <CustomBuilder />

      <section className={pages.section} aria-labelledby="custom-faq-title">
        <div className={pages.wrap}>
          <p className={pages.eyebrow}><span /> Custom design answers</p>
          <h2 id="custom-faq-title" className={pages.h2}>Before you send the brief.</h2>
          <div className={pages.cards} style={{ marginTop: "2.5rem" }}>
            {CUSTOM_FAQS.map((item) => (
              <article className={pages.card} key={item.question}>
                <h3 className={pages.h3}>{item.question}</h3>
                <p className={pages.p} style={{ margin: 0 }}>{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

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
      <JsonLd data={faqPageSchema(CUSTOM_FAQS)} />
    </main>
  );
}

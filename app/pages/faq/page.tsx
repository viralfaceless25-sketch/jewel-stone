import type { Metadata } from "next";
import { ArticlePage } from "@/components/pages/ArticlePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqPageSchema, type FaqItem } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Diamond Jewelry FAQ — Certification, Custom Design & Shipping",
  description: "Direct answers from Jewel Stone on natural and lab-grown diamonds, PIECUT jewelry, certification, custom quotations, sizing, payment, and insured shipping.",
  alternates: { canonical: "/pages/faq" },
};

const FAQS: FaqItem[] = [
  {
    question: "Are Jewel Stone diamonds certified?",
    answer: "Yes. Jewel Stone uses GIA- or IGI-certified natural and lab-grown diamonds when certification applies, and the corresponding certificate accompanies the piece.",
  },
  {
    question: "What is PIECUT diamond jewelry?",
    answer: "PIECUT jewelry precisely matches multiple diamonds into one larger geometric silhouette. Jewel Stone uses this construction as a distinctive design language for one-of-a-kind rings, earrings, and pendants.",
  },
  {
    question: "What is the difference between natural and lab-grown diamonds?",
    answer: "Natural and lab-grown diamonds have the same crystal structure and optical properties. Natural diamonds form geologically and carry rarity; lab-grown diamonds are created in controlled conditions and generally offer more size or grade for the budget.",
  },
  {
    question: "What does one of one mean?",
    answer: "A one-of-one signature piece is made once and offered as the exact photographed piece. Availability is confirmed before payment because it cannot be sold to two clients.",
  },
  {
    question: "How do Jewel Stone 3D and AR views work?",
    answer: "Supported product pages include an interactive 3D model that can be rotated and enlarged. Compatible phones can open the model in augmented reality to preview scale and form in the client’s space.",
  },
  {
    question: "Can I change the metal or ring size?",
    answer: "Most pieces can be finished or made to order in rose, yellow, or white gold, or platinum, and most rings can be sized. Final feasibility is confirmed for the chosen design before production.",
  },
  {
    question: "How does a custom jewelry quotation work?",
    answer: "Submit one to six reference images, a public reference link, or both, then complete the design brief. The owner reviews the request and sends a private estimated quotation and production timeline for acceptance or revision; accepting the quotation does not automatically charge a card.",
  },
  {
    question: "How do payment and insured shipping work?",
    answer: "Made-to-order pieces can use secure Stripe Checkout when available. One-of-one and custom pieces are confirmed privately before payment, and finished orders ship with insurance and tracking.",
  },
];

export default function FaqPage() {
  return (
    <>
      <ArticlePage
        eyebrow="Good to know"
        title="Diamond jewelry questions, answered"
        intro="Direct answers on diamonds, PIECUT construction, custom quotations, sizing, payment, and insured delivery."
        sections={FAQS.map((item) => ({ h: item.question, body: [item.answer] }))}
      />
      <JsonLd data={faqPageSchema(FAQS)} />
    </>
  );
}

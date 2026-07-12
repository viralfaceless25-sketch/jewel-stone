import type { Metadata } from "next";
import { ArticlePage } from "@/components/pages/ArticlePage";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers on certification, one-of-a-kind pieces, 3D & AR, sizing, shipping, and custom design at Jewel Stone.",
  alternates: { canonical: "/pages/faq" },
};

export default function FaqPage() {
  return (
    <ArticlePage
      eyebrow="Good to know"
      title="Frequently asked"
      intro="Everything about buying a one-of-a-kind Jewel Stone piece — from certificates to sizing to AR."
      sections={[
        { h: "Are the diamonds certified?", body: ["Yes. Our stones are GIA or IGI certified, natural or lab-grown, and the certificate accompanies every piece."] },
        { h: "What does “one of one” mean?", body: ["Each signature piece is made a single time and photographed and scanned in-house. When it sells, it's gone — the piece you see is the exact piece you receive."] },
        { h: "How do the 3D and AR views work?", body: ["Every signature piece has a true-to-scale 3D scan. On desktop you can drag to turn and zoom. On a phone, tap “View in your space” to place the piece on your hand or table in AR before you buy."] },
        { h: "Can I change the metal or size?", body: ["Yes — most pieces can be finished to order in rose, yellow, white gold or platinum, and rings can be resized. Choose your options on the product page or ask us at checkout."] },
        { h: "Do you make custom pieces?", body: ["We do. Start on the Custom page and answer five quick questions; we return stone options and a sketch within a business day."] },
        { h: "How do I pay?", body: ["Reserve online and we confirm availability, then send a secure payment link. Card payments are processed by Stripe; shipping is fully insured."] },
      ]}
    />
  );
}

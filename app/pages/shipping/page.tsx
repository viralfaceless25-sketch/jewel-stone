import type { Metadata } from "next";
import { ArticlePage } from "@/components/pages/ArticlePage";

export const metadata: Metadata = {
  title: "Shipping",
  description: "Fully insured, signature-required FedEx shipping on every Jewel Stone piece, in the US and worldwide.",
  alternates: { canonical: "/pages/shipping" },
};

export default function ShippingPage() {
  return (
    <ArticlePage
      eyebrow="Delivery"
      title="Shipping"
      intro="Every piece travels fully insured and signature-required — because it's irreplaceable."
      sections={[
        { h: "Fully insured, always", body: ["All orders ship via insured FedEx with signature on delivery, at no cost to you within the US. Your piece is covered end to end until it reaches your hand."] },
        { h: "Timing", body: ["In-stock signature pieces ship within 2–3 business days after your order is confirmed. Made-to-order and custom pieces are quoted individually — typically 2–4 weeks depending on the setting and stone."] },
        { h: "International", body: ["We ship worldwide via insured FedEx International. Duties and taxes are calculated at checkout or quoted before dispatch. Delivery is usually 3–7 business days once customs clears."] },
        { h: "Tracking", body: ["You'll receive tracking as soon as your piece leaves the Diamond District. For high-value orders we may arrange a delivery window with you directly."] },
      ]}
    />
  );
}

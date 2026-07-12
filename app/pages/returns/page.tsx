import type { Metadata } from "next";
import { ArticlePage } from "@/components/pages/ArticlePage";

export const metadata: Metadata = {
  title: "Returns",
  description: "Jewel Stone's returns and exchange policy for one-of-a-kind and custom diamond jewelry.",
  alternates: { canonical: "/pages/returns" },
};

export default function ReturnsPage() {
  return (
    <ArticlePage
      eyebrow="Peace of mind"
      title="Returns & exchanges"
      intro="We want you to be certain. Here's how returns work on rare and made-to-order pieces."
      sections={[
        { h: "14-day review", body: ["Unworn signature pieces may be returned within 14 days of delivery for a full refund, in their original condition and packaging, with the certificate included. Contact us first and we'll arrange insured return shipping."] },
        { h: "Custom & made-to-order", body: ["Because bespoke and made-to-order pieces are created specifically for you, they aren't eligible for return — but we work closely with you through sketch and stone selection so there are no surprises."] },
        { h: "Resizing & adjustments", body: ["Prefer to keep the piece but need a different fit? Complimentary resizing is available on most rings; just reach out and we'll take care of it."] },
        { h: "How to start", body: ["Email or call us with your order details. We'll send an insured, prepaid return label and process your refund within 5 business days of receiving the piece."] },
      ]}
    />
  );
}

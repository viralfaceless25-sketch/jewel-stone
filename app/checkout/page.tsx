import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { isStripeEnabled } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Secure Checkout",
  description: "Reserve your one-of-a-kind Jewel Stone piece. Insured shipping, GIA & IGI certified.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <main>
      <CheckoutClient paymentsEnabled={isStripeEnabled} />
    </main>
  );
}

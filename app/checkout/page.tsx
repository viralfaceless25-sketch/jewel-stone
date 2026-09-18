import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { isStripeEnabled } from "@/lib/stripe";
import { envFlag } from "@/lib/commerce/checkout-policy";
import { currentCustomerEmail } from "@/lib/account/customer-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Secure Checkout",
  description: "Reserve your one-of-a-kind Jewel Stone piece. Insured shipping, GIA & IGI certified.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const customerEmail = await currentCustomerEmail();
  return (
    <main>
      <CheckoutClient
        paymentsEnabled={isStripeEnabled}
        allowSignatureCheckout={envFlag(process.env.STRIPE_ALLOW_SIGNATURE_CHECKOUT)}
        customerEmail={customerEmail}
      />
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutSuccessReset } from "@/components/checkout/CheckoutSuccessReset";
import styles from "@/components/checkout/checkout.module.css";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment Status",
  robots: { index: false, follow: false },
};

type CheckoutSuccessPageProps = {
  searchParams?: { session_id?: string | string[] };
};

function formatAmount(amount: number | null, currency: string | null) {
  if (amount === null || !currency) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const rawId = searchParams?.session_id;
  const sessionId = Array.isArray(rawId) ? rawId[0] : rawId;
  const validId = Boolean(sessionId && /^cs_[A-Za-z0-9_]+$/.test(sessionId) && sessionId.length <= 255);

  if (stripe && sessionId && validId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items"],
      });
      const confirmed = session.payment_status === "paid"
        && session.metadata?.source === "jewelstone-web";

      if (confirmed) {
        const reference = session.metadata?.order_reference ?? session.id;
        return (
          <main>
            <CheckoutSuccessReset />
            <div className={styles.confirm}>
              <div className={styles.check}>✓</div>
              <h1>Payment confirmed.</h1>
              <p>
                Thank you. Our Diamond District team will email certification,
                production, sizing, and insured shipping details shortly.
              </p>
              <dl className={styles.confirmationDetails}>
                <div><dt>Order reference</dt><dd>{reference}</dd></div>
                <div><dt>Email</dt><dd>{session.customer_details?.email ?? session.customer_email ?? "—"}</dd></div>
                <div><dt>Total paid</dt><dd>{formatAmount(session.amount_total, session.currency)}</dd></div>
              </dl>
              {session.line_items?.data.length ? (
                <ul className={styles.confirmedItems} aria-label="Purchased items">
                  {session.line_items.data.map((item) => (
                    <li key={item.id}>
                      <span>{item.quantity ?? 1} × {item.description}</span>
                      <strong>{formatAmount(item.amount_total, session.currency)}</strong>
                    </li>
                  ))}
                </ul>
              ) : null}
              <Link href="/collections" className={styles.primary}>Back to the collection</Link>
            </div>
          </main>
        );
      }
    } catch (error) {
      console.error("checkout confirmation retrieval failed", error);
    }
  }

  return (
    <main>
      <div className={styles.confirm}>
        <div className={`${styles.check} ${styles.pending}`}>…</div>
        <h1>Payment confirmation pending.</h1>
        <p>
          We could not verify a completed Jewel Stone payment from this link. Your
          bag has not been cleared. Return to checkout or contact us with your
          Stripe receipt reference.
        </p>
        <div className={styles.confirmActions}>
          <Link href="/checkout" className={styles.primary}>Return to checkout</Link>
          <Link href="/contact" className={styles.secondary}>Contact Jewel Stone</Link>
        </div>
      </div>
    </main>
  );
}

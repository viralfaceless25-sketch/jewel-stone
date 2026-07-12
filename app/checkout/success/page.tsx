import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/checkout/checkout.module.css";

export const metadata: Metadata = {
  title: "Order Confirmed",
  robots: { index: false, follow: false },
};

export default function CheckoutSuccessPage() {
  return (
    <main>
      <div className={styles.confirm}>
        <div className={styles.check}>✓</div>
        <h1>Thank you — your order is confirmed.</h1>
        <p>
          Your payment went through and your one-of-a-kind piece is reserved. Our
          Diamond District team will email you shortly with certification, sizing,
          and insured shipping details. Welcome to Jewel Stone.
        </p>
        <Link href="/collections" className={styles.primary}>Back to the collection</Link>
      </div>
    </main>
  );
}

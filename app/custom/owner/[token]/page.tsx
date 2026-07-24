import type { Metadata } from "next";
import { CustomQuoteManager } from "@/components/custom/CustomQuoteManager";
import styles from "@/components/custom/request-status.module.css";

export const metadata: Metadata = {
  title: "Owner Custom Quotation",
  robots: { index: false, follow: false },
};

export default function CustomOwnerPage({ params }: { params: { token: string } }) {
  return <main className={styles.portalPage}><CustomQuoteManager token={params.token} /></main>;
}

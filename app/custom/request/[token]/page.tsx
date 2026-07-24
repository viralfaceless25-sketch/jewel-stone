import type { Metadata } from "next";
import { CustomRequestStatus } from "@/components/custom/CustomRequestStatus";
import styles from "@/components/custom/request-status.module.css";

export const metadata: Metadata = {
  title: "Custom Request Status",
  robots: { index: false, follow: false },
};

export default function CustomRequestPage({ params }: { params: { token: string } }) {
  return <main className={styles.portalPage}><CustomRequestStatus token={params.token} /></main>;
}

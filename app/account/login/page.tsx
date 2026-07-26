import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentCustomerEmail } from "@/lib/account/customer-auth";
import { AccountLogin } from "@/components/account/AccountLogin";
import pages from "@/components/pages/pages.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Client Sign In",
  description: "Sign in to your Jewel Stone client account to view your orders, invoices, and memoranda.",
  robots: { index: false, follow: false },
};

export default function AccountLoginPage() {
  if (currentCustomerEmail()) redirect("/account");
  return (
    <main className={pages.page}>
      <section className={pages.hero}>
        <p className={pages.eyebrow}><span /> Client access</p>
        <h1 className={pages.h1}>Your <em>account.</em></h1>
        <p className={pages.lede}>
          Sign in with the e-mail or mobile number you gave us, and the password Jewel Stone
          issued you. Your orders, invoices, and memoranda are all here.
        </p>
      </section>
      <section className={pages.section}>
        <div className={pages.narrow}>
          <AccountLogin />
        </div>
      </section>
    </main>
  );
}

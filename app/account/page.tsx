import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentCustomerEmail } from "@/lib/account/customer-auth";
import { getCustomer, listOrdersForCustomer } from "@/lib/admin/orders";
import { listDocuments } from "@/lib/admin/documents";
import { getKyc } from "@/lib/admin/kyc";
import { KYC_STATUS_LABELS } from "@/lib/admin/kyc-shared";
import { resolveTerms } from "@/lib/admin/terms";
import { formatMoney } from "@/lib/admin/order-shared";
import { AccountPortal } from "@/components/account/AccountPortal";
import pages from "@/components/pages/pages.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const email = currentCustomerEmail();
  if (!email) redirect("/account/login");

  const [customer, orders, allDocuments, kyc, terms] = await Promise.all([
    getCustomer(email).catch(() => null),
    listOrdersForCustomer(email).catch(() => []),
    listDocuments().catch(() => []),
    getKyc(email).catch(() => null),
    resolveTerms(email).catch(() => null),
  ]);

  // Only this customer's paperwork, and never anything still in draft.
  const documents = allDocuments
    .filter((document) => document.customer.email?.toLowerCase() === email.toLowerCase())
    .filter((document) => document.status !== "draft")
    .map((document) => ({
      number: document.number,
      kind: document.kind,
      issueDate: document.issueDate,
      dueDate: document.dueDate ?? "",
      total: formatMoney(document.total),
      status: document.status,
      terms: document.terms,
    }));

  return (
    <main className={pages.page}>
      <section className={pages.hero}>
        <p className={pages.eyebrow}><span /> Client account</p>
        <h1 className={pages.h1}>{customer?.name ? `Welcome, ${customer.name.split(" ")[0]}.` : "Your account."}</h1>
        <p className={pages.lede}>
          Everything Jewel Stone holds for you — your orders, invoices, memoranda, and the
          status of your account paperwork.
        </p>
      </section>
      <section className={pages.section}>
        <div className={pages.wrap}>
          <AccountPortal
            email={email}
            name={customer?.name ?? ""}
            orders={orders.map((order) => ({
              id: order.id,
              date: order.createdAt ?? "",
              total: formatMoney(order.amountTotal),
              status: order.status,
              items: order.items.map((item) => `${item.name} × ${item.qty}`),
            }))}
            documents={documents}
            kycStatus={kyc ? KYC_STATUS_LABELS[kyc.status] : "Not started"}
            invoiceTerms={terms?.invoiceTerms ?? "Advance payment"}
            memoDays={terms?.memoDays ?? 7}
          />
        </div>
      </section>
    </main>
  );
}

import "server-only";

import type { BusinessDocument } from "./documents";
import type { DocumentLineItem } from "./document-math";
import { createOrder, ensureCustomer, upsertCustomerFromOrder } from "./orders";

// Bridges the paperwork to the books. An invoice raised in the panel is a real
// sale — a walk-in, a phone order, a bank transfer — so once it is marked paid
// it has to appear in Orders and count toward revenue exactly like a website
// checkout does. Memoranda are goods on approval, not sales, so they never
// create an order.

/** Stable key so marking the same invoice paid twice cannot duplicate an order. */
function orderKeyFor(document: BusinessDocument) {
  return `document:${document.number}`;
}

/** Anyone a document is raised for belongs in the customer base. */
export async function syncDocumentCustomer(document: BusinessDocument) {
  const email = document.customer.email?.trim();
  if (!email) return null;
  return ensureCustomer({
    name: document.customer.name,
    email,
    phone: document.customer.phone,
  }).catch((error) => {
    console.error("document customer sync failed", document.number, error);
    return null;
  });
}

/**
 * Records a paid invoice as an order. Safe to call repeatedly — createOrder is
 * idempotent on the key above, so re-saving a paid invoice won't double-count.
 */
export async function recordPaidDocument(document: BusinessDocument) {
  if (document.kind !== "invoice" || document.status !== "paid") return null;
  if (!document.customer.email?.trim()) return null;

  try {
    const { order, created } = await createOrder({
      stripeSessionId: orderKeyFor(document),
      orderReference: document.number,
      items: document.lineItems.map((item: DocumentLineItem) => ({
        slug: item.code || document.number,
        name: item.description,
        qty: item.quantity,
        unitPrice: item.unitPrice,
      })),
      amountTotal: document.total,
      currency: "usd",
      customer: {
        name: document.customer.name,
        email: document.customer.email,
        phone: document.customer.phone ?? "",
      },
      shippingAddress: null,
      createdAt: document.issueDate ? `${document.issueDate}T12:00:00.000Z` : undefined,
    });
    if (created) await upsertCustomerFromOrder(order);
    return order;
  } catch (error) {
    console.error("paid document not recorded as an order", document.number, error);
    return null;
  }
}

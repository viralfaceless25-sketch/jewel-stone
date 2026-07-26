import "server-only";

import { kvGetMany, kvSet, kvSetAdd, kvSetMembers } from "@/lib/kv";

export type PaymentLinkRecord = {
  id: string;
  customerName: string;
  email: string;
  description: string;
  amount: number;
  url: string;
  createdAt: string;
};

const indexKey = "jewelstone:payment-links";
const recordKey = (id: string) => `jewelstone:payment-link:${id}`;

export async function savePaymentLink(record: PaymentLinkRecord) {
  await kvSet(recordKey(record.id), record);
  await kvSetAdd(indexKey, record.id);
  return record;
}

export async function listPaymentLinks() {
  const ids = await kvSetMembers(indexKey);
  const rows = await kvGetMany<PaymentLinkRecord>(ids.map(recordKey));
  return rows
    .filter((row): row is PaymentLinkRecord => Boolean(row))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

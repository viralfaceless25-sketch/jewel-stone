import "server-only";

import { randomUUID } from "node:crypto";
import {
  kvDel,
  kvGet,
  kvGetMany,
  kvIncrBy,
  kvSet,
  kvSetAdd,
  kvSetIfAbsent,
  kvSetMembers,
} from "@/lib/kv";
import { customerKey } from "./order-items";
import type {
  Customer,
  Order,
  OrderCustomer,
  OrderItem,
  OrderStatus,
  ShippingAddress,
} from "./order-shared";

const orderIndex = "jewelstone:orders";
const customerIndex = "jewelstone:customers";
const orderKey = (id: string) => `jewelstone:order:${id}`;
const sessionKey = (sessionId: string) => `jewelstone:order-session:${sessionId}`;
const customerRecordKey = (email: string) => `jewelstone:customer:${customerKey(email)}`;

export type NewOrder = {
  stripeSessionId: string;
  paymentIntentId?: string;
  orderReference?: string;
  items: OrderItem[];
  amountTotal: number;
  currency: string;
  customer: OrderCustomer;
  shippingAddress: ShippingAddress | null;
  createdAt?: string;
};

async function nextOrderId() {
  const value = await kvIncrBy("jewelstone:counter:order", 1);
  return `JS-${String(value).padStart(5, "0")}`;
}

export const getOrder = (id: string) => kvGet<Order>(orderKey(id));

export async function getOrderByStripeSession(sessionId: string) {
  const id = await kvGet<string>(sessionKey(sessionId));
  if (!id || id.startsWith("pending:")) return null;
  return getOrder(id);
}

export async function createOrder(input: NewOrder): Promise<{ order: Order; created: boolean }> {
  const existing = await getOrderByStripeSession(input.stripeSessionId);
  if (existing) return { order: existing, created: false };

  const claim = `pending:${randomUUID()}`;
  const claimed = await kvSetIfAbsent(sessionKey(input.stripeSessionId), claim, 90);
  if (!claimed) {
    const replay = await getOrderByStripeSession(input.stripeSessionId);
    if (replay) return { order: replay, created: false };
    throw new Error("order_creation_in_progress");
  }

  try {
    const now = input.createdAt ?? new Date().toISOString();
    const order: Order = {
      id: await nextOrderId(),
      createdAt: now,
      updatedAt: now,
      stripeSessionId: input.stripeSessionId,
      paymentIntentId: input.paymentIntentId,
      orderReference: input.orderReference,
      items: input.items,
      amountTotal: input.amountTotal,
      currency: input.currency,
      customer: input.customer,
      shippingAddress: input.shippingAddress,
      status: "paid",
    };
    await kvSet(orderKey(order.id), order);
    await kvSetAdd(orderIndex, order.id);
    await kvSet(sessionKey(input.stripeSessionId), order.id);
    return { order, created: true };
  } catch (error) {
    const owner = await kvGet<string>(sessionKey(input.stripeSessionId));
    if (owner === claim) await kvDel(sessionKey(input.stripeSessionId));
    throw error;
  }
}

export async function listOrders() {
  const ids = await kvSetMembers(orderIndex);
  const rows = await kvGetMany<Order>(ids.map(orderKey));
  return rows
    .filter((row): row is Order => Boolean(row))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
}

export async function updateOrder(
  id: string,
  patch: { status?: OrderStatus; trackingNumber?: string; trackingUrl?: string },
) {
  const current = await getOrder(id);
  if (!current) return null;
  const next: Order = {
    ...current,
    updatedAt: new Date().toISOString(),
    status: patch.status ?? current.status,
    trackingNumber:
      patch.trackingNumber === undefined
        ? current.trackingNumber
        : patch.trackingNumber.trim().slice(0, 120) || undefined,
    trackingUrl:
      patch.trackingUrl === undefined
        ? current.trackingUrl
        : patch.trackingUrl.trim().slice(0, 500) || undefined,
  };
  await kvSet(orderKey(id), next);
  return next;
}

export async function upsertCustomerFromOrder(order: Order) {
  const email = order.customer.email.trim();
  if (!email) return null;
  const current = await kvGet<Customer>(customerRecordKey(email));
  const alreadyCounted = current?.orderIds.includes(order.id) ?? false;
  const orderIds = alreadyCounted ? current!.orderIds : [...(current?.orderIds ?? []), order.id];
  const next: Customer = {
    name: order.customer.name || current?.name || "",
    email,
    phone: order.customer.phone || current?.phone || "",
    firstPurchase:
      current?.firstPurchase && current.firstPurchase < order.createdAt
        ? current.firstPurchase
        : order.createdAt,
    lastPurchase:
      current?.lastPurchase && current.lastPurchase > order.createdAt
        ? current.lastPurchase
        : order.createdAt,
    orderCount: orderIds.length,
    totalSpent: alreadyCounted ? current?.totalSpent ?? 0 : (current?.totalSpent ?? 0) + order.amountTotal,
    orderIds,
    notes: current?.notes ?? "",
    updatedAt: new Date().toISOString(),
  };
  await kvSet(customerRecordKey(email), next);
  await kvSetAdd(customerIndex, customerKey(email));
  return next;
}

export async function listCustomers() {
  const keys = await kvSetMembers(customerIndex);
  const rows = await kvGetMany<Customer>(keys.map((key) => `jewelstone:customer:${key}`));
  return rows
    .filter((row): row is Customer => Boolean(row))
    .sort((a, b) => b.lastPurchase.localeCompare(a.lastPurchase));
}

export async function getCustomer(email: string) {
  return kvGet<Customer>(customerRecordKey(email));
}

export async function updateCustomerNotes(email: string, notes: string) {
  const customer = await getCustomer(email);
  if (!customer) return null;
  const next = { ...customer, notes: notes.trim().slice(0, 5000), updatedAt: new Date().toISOString() };
  await kvSet(customerRecordKey(email), next);
  return next;
}

export async function listOrdersForCustomer(email: string) {
  const key = customerKey(email);
  return (await listOrders()).filter((order) => customerKey(order.customer.email) === key);
}

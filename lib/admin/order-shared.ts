export const ORDER_STATUSES = [
  "paid",
  "in_production",
  "shipped",
  "delivered",
  "refunded",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  paid: "Paid",
  in_production: "In production",
  shipped: "Shipped",
  delivered: "Delivered",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

export type OrderItem = {
  slug: string;
  name: string;
  qty: number;
  unitPrice: number;
  metal?: string;
  size?: string;
  grade?: string;
};

export type OrderCustomer = { name: string; email: string; phone: string };

export type ShippingAddress = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type Order = {
  id: string;
  createdAt: string;
  updatedAt: string;
  stripeSessionId: string;
  paymentIntentId?: string;
  orderReference?: string;
  items: OrderItem[];
  amountTotal: number;
  currency: string;
  customer: OrderCustomer;
  shippingAddress: ShippingAddress | null;
  status: OrderStatus;
  trackingNumber?: string;
  trackingUrl?: string;
};

export type Customer = {
  name: string;
  email: string;
  phone: string;
  firstPurchase: string;
  lastPurchase: string;
  orderCount: number;
  totalSpent: number;
  orderIds: string[];
  notes: string;
  /** Agreed terms for this account. Blank falls back to the house default
      (advance payment for invoices, 7 days for memoranda). */
  paymentTerms?: string;
  memoDays?: number;
  updatedAt: string;
};

export function formatMoney(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format((Number.isFinite(cents) ? cents : 0) / 100);
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && ORDER_STATUSES.includes(value as OrderStatus);
}


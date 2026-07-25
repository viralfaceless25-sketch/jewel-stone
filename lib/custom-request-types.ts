export const CUSTOM_REQUEST_STATUSES = [
  "awaiting_quote",
  "quoted",
  "accepted",
  "declined",
  "in_production",
  "shipped",
] as const;

export type CustomRequestStatus = (typeof CUSTOM_REQUEST_STATUSES)[number];

export type CustomDesignChoices = {
  type: string;
  metal: string;
  shape: string;
  origin: string;
  budget: string;
};

export type CustomReferenceFile = {
  name: string;
  size: number;
  type: string;
};

export type CustomQuote = {
  estimate: string;
  leadTime: string;
  message: string;
  validUntil?: string;
  createdAt: string;
  // Exact amount the customer pays when they accept (in cents). When absent,
  // accepting is a confirmation only (no card charge).
  amountCents?: number;
};

export type CustomDecision = {
  value: "accepted" | "declined";
  note: string;
  createdAt: string;
};

export type CustomShipment = {
  carrier: string;
  trackingNumber: string;
  trackingUrl?: string;
  createdAt: string;
};

export type CustomRequestRecord = {
  id: string;
  publicToken: string;
  ownerToken: string;
  createdAt: string;
  updatedAt: string;
  status: CustomRequestStatus;
  name: string;
  email: string;
  phone: string;
  choices: CustomDesignChoices;
  notes: string;
  referenceUrl?: string;
  referenceFiles: CustomReferenceFile[];
  quote?: CustomQuote;
  decision?: CustomDecision;
  paidAt?: string;
  paymentSessionId?: string;
  productionStartedAt?: string;
  shipment?: CustomShipment;
};

export type CustomerCustomRequest = Omit<CustomRequestRecord, "ownerToken" | "email" | "phone"> & {
  notificationEmail: string;
};

export const STATUS_LABELS: Record<CustomRequestStatus, string> = {
  awaiting_quote: "Awaiting quotation",
  quoted: "Quotation ready",
  accepted: "Quotation accepted",
  declined: "Quotation declined",
  in_production: "In production",
  shipped: "Shipped",
};

export function canOwnerQuote(status: CustomRequestStatus) {
  return ["awaiting_quote", "quoted", "declined"].includes(status);
}

export function canCustomerDecide(status: CustomRequestStatus) {
  return status === "quoted";
}

export function canStartProduction(status: CustomRequestStatus) {
  return status === "accepted";
}

export function canMarkShipped(status: CustomRequestStatus) {
  return status === "in_production";
}

export function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "your email";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"•".repeat(Math.max(3, local.length - visible.length))}@${domain}`;
}

export function toCustomerCustomRequest(record: CustomRequestRecord): CustomerCustomRequest {
  const { ownerToken: _ownerToken, email, phone: _phone, ...publicRecord } = record;
  return { ...publicRecord, notificationEmail: maskEmail(email) };
}

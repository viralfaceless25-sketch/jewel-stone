import "server-only";

import {
  kvDel,
  kvGet,
  kvSetMembers,
  kvSetRemove,
} from "@/lib/kv";
import { customerKey } from "./order-items";

export const DEFAULT_CLEAR_SECTIONS = [
  "orders",
  "customers",
  "kyc",
  "inbox",
  "documents",
  "promotions",
  "operations",
] as const;
export const OPTIONAL_CLEAR_SECTIONS = ["accounts"] as const;
export type ClearSection =
  | (typeof DEFAULT_CLEAR_SECTIONS)[number]
  | (typeof OPTIONAL_CLEAR_SECTIONS)[number];

type OrderRecord = {
  stripeSessionId?: string;
  createdAt?: string;
  customer?: { name?: string; email?: string };
};
type CustomerRecord = { name?: string; email?: string; updatedAt?: string };
type KycRecord = { email?: string; updatedAt?: string; files?: Array<{ id?: string }> };
type LeadRecord = { name?: string; email?: string; createdAt?: string };
type CustomRequestRecord = {
  name?: string;
  email?: string;
  createdAt?: string;
  publicToken?: string;
  ownerToken?: string;
};
type DocumentRecord = {
  kind?: string;
  customer?: { name?: string; email?: string };
  createdAt?: string;
};
type PromoRedemption = { email?: string };
type PromoRecord = { label?: string; updatedAt?: string };
type OperationRecord = { customerName?: string; customerEmail?: string; createdAt?: string };
type CustomerAccount = { email?: string; phone?: string; name?: string };

export type ClearDeletion = {
  section: ClearSection;
  key: string;
  description: string;
};
export type ClearIndexRemoval = {
  section: ClearSection;
  index: string;
  member: string;
};
export type AdminDataClearPlan = {
  sections: ClearSection[];
  deletions: ClearDeletion[];
  removals: ClearIndexRemoval[];
  counts: Record<string, number>;
};

function normalizePhone(phone: string) {
  const digits = (phone || "").replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function details(...values: Array<string | undefined>) {
  return values
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" · ");
}

export function validateClearSections(values: string[]): ClearSection[] {
  const allowed = new Set<ClearSection>([
    ...DEFAULT_CLEAR_SECTIONS,
    ...OPTIONAL_CLEAR_SECTIONS,
  ]);
  const sections = values
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean) as ClearSection[];
  const unknown = sections.filter((section) => !allowed.has(section));
  if (unknown.length) {
    throw new Error(`Unknown section${unknown.length === 1 ? "" : "s"}: ${unknown.join(", ")}`);
  }
  if (!sections.length) throw new Error("Choose at least one section.");
  return [...new Set(sections)];
}

export async function planAdminDataClear(
  requested: readonly ClearSection[] = DEFAULT_CLEAR_SECTIONS,
): Promise<AdminDataClearPlan> {
  const sections = validateClearSections([...requested]);
  const deletions: ClearDeletion[] = [];
  const removals: ClearIndexRemoval[] = [];
  const seen = new Set<string>();
  const counts: Record<string, number> = {};

  function count(label: string, amount = 1) {
    counts[label] = (counts[label] ?? 0) + amount;
  }

  function add(section: ClearSection, key: string, description: string) {
    if (!key || seen.has(key)) return;
    seen.add(key);
    deletions.push({ section, key, description });
  }

  async function indexed(section: ClearSection, index: string) {
    const members = await kvSetMembers(index);
    members.forEach((member) => removals.push({ section, index, member }));
    return members;
  }

  if (sections.includes("orders")) {
    for (const id of await indexed("orders", "jewelstone:orders")) {
      const key = `jewelstone:order:${id}`;
      const order = await kvGet<OrderRecord>(key);
      if (order?.stripeSessionId) {
        add("orders", `jewelstone:order-session:${order.stripeSessionId}`, `Stripe session pointer for ${id}`);
      }
      add(
        "orders",
        key,
        details(`Order ${id}`, order?.customer?.name, order?.customer?.email, order?.createdAt),
      );
      count("orders");
    }
  }

  if (sections.includes("customers")) {
    for (const keyPart of await indexed("customers", "jewelstone:customers")) {
      const key = `jewelstone:customer:${keyPart}`;
      const customer = await kvGet<CustomerRecord>(key);
      add(
        "customers",
        key,
        details("Customer", customer?.name, customer?.email ?? keyPart, customer?.updatedAt),
      );
      count("customers");
    }
  }

  if (sections.includes("kyc")) {
    for (const keyPart of await indexed("kyc", "jewelstone:kyc")) {
      const key = `jewelstone:kyc:${keyPart}`;
      const record = await kvGet<KycRecord>(key);
      for (const file of record?.files ?? []) {
        if (!file.id) continue;
        add("kyc", `jewelstone:kyc-file:${file.id}`, `KYC file ${file.id}`);
        count("KYC files");
      }
      add(
        "kyc",
        key,
        details("KYC record", record?.email ?? keyPart, record?.updatedAt),
      );
      count("KYC records");
    }
  }

  if (sections.includes("inbox")) {
    for (const id of await indexed("inbox", "jewelstone:inquiries")) {
      const key = `jewelstone:inquiry:${id}`;
      const record = await kvGet<LeadRecord>(key);
      add("inbox", key, details(`Inquiry ${id}`, record?.name, record?.email, record?.createdAt));
      count("inquiries");
    }
    for (const id of await indexed("inbox", "jewelstone:appointments")) {
      const key = `jewelstone:appointment:${id}`;
      const record = await kvGet<LeadRecord>(key);
      add("inbox", key, details(`Appointment ${id}`, record?.name, record?.email, record?.createdAt));
      count("appointments");
    }
    for (const id of await indexed("inbox", "jewelstone:custom-requests")) {
      const key = `jewelstone:custom-request:${id}`;
      const record = await kvGet<CustomRequestRecord>(key);
      if (record?.publicToken) {
        add("inbox", `jewelstone:custom-public:${record.publicToken}`, `Public pointer for ${id}`);
      }
      if (record?.ownerToken) {
        add("inbox", `jewelstone:custom-owner:${record.ownerToken}`, `Owner pointer for ${id}`);
      }
      add(
        "inbox",
        key,
        details(`Custom request ${id}`, record?.name, record?.email, record?.createdAt),
      );
      count("custom requests");
    }
  }

  if (sections.includes("documents")) {
    for (const number of await indexed("documents", "jewelstone:documents")) {
      const key = `jewelstone:document:${number}`;
      const record = await kvGet<DocumentRecord>(key);
      add(
        "documents",
        key,
        details(
          `${record?.kind === "memo" ? "Memo" : "Invoice"} ${number}`,
          record?.customer?.name,
          record?.customer?.email,
          record?.createdAt,
        ),
      );
      count("documents");
    }
  }

  if (sections.includes("promotions")) {
    for (const code of await indexed("promotions", "jewelstone:promos")) {
      const promo = await kvGet<PromoRecord>(`jewelstone:promo:${code}`);
      const logKey = `jewelstone:promo-log:${code}`;
      const redemptions = (await kvGet<PromoRedemption[]>(logKey)) ?? [];
      for (const entry of redemptions) {
        if (!entry.email) continue;
        add(
          "promotions",
          `jewelstone:promo-use:${code}:${customerKey(entry.email)}`,
          `Customer-use counter for ${code}`,
        );
      }
      add("promotions", logKey, `Redemption log ${code}`);
      add("promotions", `jewelstone:promo-count:${code}`, `Atomic use counter ${code}`);
      add(
        "promotions",
        `jewelstone:promo:${code}`,
        details(`Promotion ${code}`, promo?.label, promo?.updatedAt),
      );
      count("promotions");
      count("promotion redemptions", redemptions.length);
    }
  }

  if (sections.includes("operations")) {
    for (const id of await indexed("operations", "jewelstone:payment-links")) {
      const key = `jewelstone:payment-link:${id}`;
      const record = await kvGet<OperationRecord>(key);
      add(
        "operations",
        key,
        details(`Payment link ${id}`, record?.customerName, record?.customerEmail, record?.createdAt),
      );
      count("payment links");
    }
    for (const id of await indexed("operations", "jewelstone:service-tickets")) {
      const key = `jewelstone:service-ticket:${id}`;
      const record = await kvGet<OperationRecord>(key);
      add(
        "operations",
        key,
        details(`Service ticket ${id}`, record?.customerName, record?.customerEmail, record?.createdAt),
      );
      count("service tickets");
    }
    for (const id of await indexed("operations", "jewelstone:activity")) {
      add("operations", `jewelstone:activity:${id}`, `Activity ${id}`);
      count("activity records");
    }
  }

  if (sections.includes("accounts")) {
    for (const keyPart of await indexed("accounts", "jewelstone:accounts")) {
      const key = `jewelstone:account:${keyPart}`;
      const account = await kvGet<CustomerAccount>(key);
      const digits = normalizePhone(account?.phone ?? "");
      if (digits) {
        add("accounts", `jewelstone:account-phone:${digits}`, `Phone pointer for ${keyPart}`);
      }
      add(
        "accounts",
        key,
        details("Customer login", account?.name, account?.email ?? keyPart),
      );
      count("customer logins");
    }
  }

  return { sections, deletions, removals, counts };
}

export async function executeAdminDataClear(plan: AdminDataClearPlan) {
  // Child and pointer keys are deliberately added before parent records.
  for (const item of plan.deletions) await kvDel(item.key);
  for (const item of plan.removals) await kvSetRemove(item.index, item.member);
}

export function clearPlanSummary(plan: AdminDataClearPlan) {
  return Object.entries(plan.counts)
    .filter(([, amount]) => amount > 0)
    .map(([label, amount]) => `${amount} ${label}`)
    .join(", ");
}

/**
 * Clears test data out of the admin panel.
 *
 *   npx tsx --conditions=react-server scripts/clear-admin-data.ts
 *   npm run clear:admin -- --only=orders,customers --yes
 *
 * Dry run by default: it prints exactly what it would delete and touches
 * nothing. Pass --yes to actually delete. There is no undo.
 *
 * The store has no SCAN, so nothing here can pattern-match keys — every record
 * is reached through its index set, and child keys (KYC file payloads, promo
 * redemption counters, custom-request tokens, order-session pointers) are read
 * out of the parent record before the parent goes. Delete in the other order and
 * the children are orphaned forever.
 *
 * Deliberately left alone: admin settings (bank details the invoice needs),
 * products, stock overlays, and customer portal logins. See KEPT below.
 *
 * Numbering counters (order, invoice, memo, service ticket) also survive by
 * default, so the next order after a clear-out carries on from JS-00004 rather
 * than reusing JS-00001. Pass --reset-counters to restart the numbering, which
 * is only safe while no paperwork has been sent to anyone.
 */
import { kvConfigured, kvDel, kvGet, kvSetMembers } from "@/lib/kv";
import { customerKey } from "@/lib/admin/order-items";
import type { Order } from "@/lib/admin/order-shared";
import type { KycRecord } from "@/lib/admin/kyc-shared";
import type { PromoRedemption } from "@/lib/admin/promo-codes";
import type { CustomRequestRecord } from "@/lib/custom-request-types";

type Plan = {
  /** Individual keys to delete. */
  keys: string[];
  /** Index sets to drop wholesale once their records are gone. */
  indexes: string[];
  /**
   * Numbering counters this section owns. Only cleared with --reset-counters,
   * because restarting at 1 reissues numbers that may already be on paperwork
   * a customer has seen.
   */
  counters?: string[];
  /** What to tell the owner, e.g. "12 orders (9 session pointers)". */
  summary: string;
};

const EMPTY: Plan = { keys: [], indexes: [], summary: "nothing" };

/** Keys this script must never touch, and why. Printed on every run. */
const KEPT = [
  ["jewelstone:admin-settings", "business details, bank account, routing, Zelle — the invoice needs these"],
  ["jewelstone:product:* / jewelstone:products", "admin-created products"],
  ["jewelstone:stock:* / jewelstone:stock-count:*", "real stock levels, including memo goods on hand"],
  ["jewelstone:account:* / jewelstone:accounts", "customer portal logins (see --with-logins)"],
];

async function plan_orders(): Promise<Plan> {
  const ids = await kvSetMembers("jewelstone:orders");
  const orders = await Promise.all(ids.map((id) => kvGet<Order>(`jewelstone:order:${id}`)));
  // Stripe session pointers are what make order creation idempotent; they are
  // only reachable through the order record that names them.
  const sessions = orders
    .map((order) => order?.stripeSessionId)
    .filter((id): id is string => Boolean(id))
    .map((id) => `jewelstone:order-session:${id}`);
  return {
    keys: [...ids.map((id) => `jewelstone:order:${id}`), ...sessions],
    indexes: ["jewelstone:orders"],
    counters: ["jewelstone:counter:order"],
    summary: `${ids.length} orders (${sessions.length} session pointers)`,
  };
}

async function plan_customers(): Promise<Plan> {
  const keys = await kvSetMembers("jewelstone:customers");
  return {
    keys: keys.map((key) => `jewelstone:customer:${key}`),
    indexes: ["jewelstone:customers"],
    summary: `${keys.length} customers`,
  };
}

async function plan_kyc(): Promise<Plan> {
  const keys = await kvSetMembers("jewelstone:kyc");
  const records = await Promise.all(keys.map((key) => kvGet<KycRecord>(`jewelstone:kyc:${key}`)));
  // File payloads live under their own keys, listed only inside the record.
  const files = records.flatMap((record) =>
    (record?.files ?? []).map((file) => `jewelstone:kyc-file:${file.id}`),
  );
  return {
    keys: [...keys.map((key) => `jewelstone:kyc:${key}`), ...files],
    indexes: ["jewelstone:kyc"],
    summary: `${keys.length} KYC records (${files.length} uploaded documents)`,
  };
}

async function plan_inbox(): Promise<Plan> {
  const [inquiries, appointments, requests] = await Promise.all([
    kvSetMembers("jewelstone:inquiries"),
    kvSetMembers("jewelstone:appointments"),
    kvSetMembers("jewelstone:custom-requests"),
  ]);
  const records = await Promise.all(
    requests.map((id) => kvGet<CustomRequestRecord>(`jewelstone:custom-request:${id}`)),
  );
  // Each custom request is addressable by two unguessable tokens; both pointer
  // keys have to go or the customer-facing link keeps resolving.
  const tokens = records.flatMap((record) =>
    record
      ? [
          `jewelstone:custom-public:${record.publicToken}`,
          `jewelstone:custom-owner:${record.ownerToken}`,
        ]
      : [],
  );
  return {
    keys: [
      ...inquiries.map((id) => `jewelstone:inquiry:${id}`),
      ...appointments.map((id) => `jewelstone:appointment:${id}`),
      ...requests.map((id) => `jewelstone:custom-request:${id}`),
      ...tokens,
    ],
    indexes: ["jewelstone:inquiries", "jewelstone:appointments", "jewelstone:custom-requests"],
    summary:
      `${inquiries.length} inquiries, ${appointments.length} appointments, ` +
      `${requests.length} custom requests (${tokens.length} link tokens)`,
  };
}

async function plan_documents(): Promise<Plan> {
  const numbers = await kvSetMembers("jewelstone:documents");
  return {
    keys: numbers.map((number) => `jewelstone:document:${number}`),
    indexes: ["jewelstone:documents"],
    counters: ["jewelstone:counter:inv", "jewelstone:counter:memo"],
    summary: `${numbers.length} invoices and memoranda`,
  };
}

async function plan_promotions(): Promise<Plan> {
  const codes = await kvSetMembers("jewelstone:promos");
  const logs = await Promise.all(
    codes.map((code) => kvGet<PromoRedemption[]>(`jewelstone:promo-log:${code}`)),
  );
  // Per-customer redemption counters have no index of their own — the only
  // record of which customers used a code is the redemption log, so derive the
  // counter keys from it before the log is deleted.
  const counters = new Set<string>();
  logs.forEach((log, index) => {
    for (const entry of log ?? []) {
      if (entry.email) counters.add(`jewelstone:promo-use:${codes[index]}:${customerKey(entry.email)}`);
    }
  });
  return {
    keys: [
      ...codes.map((code) => `jewelstone:promo:${code}`),
      ...codes.map((code) => `jewelstone:promo-log:${code}`),
      ...counters,
    ],
    indexes: ["jewelstone:promos"],
    summary: `${codes.length} promotion codes (${counters.size} per-customer counters)`,
  };
}

async function plan_operations(): Promise<Plan> {
  const [links, tickets, activity] = await Promise.all([
    kvSetMembers("jewelstone:payment-links"),
    kvSetMembers("jewelstone:service-tickets"),
    kvSetMembers("jewelstone:activity"),
  ]);
  return {
    keys: [
      ...links.map((id) => `jewelstone:payment-link:${id}`),
      ...tickets.map((id) => `jewelstone:service-ticket:${id}`),
      ...activity.map((id) => `jewelstone:activity:${id}`),
    ],
    indexes: ["jewelstone:payment-links", "jewelstone:service-tickets", "jewelstone:activity"],
    counters: ["jewelstone:counter:service-ticket"],
    summary: `${links.length} payment links, ${tickets.length} service tickets, ${activity.length} activity entries`,
  };
}

/** Opt-in: the trade logins issued from the KYC screen. */
async function plan_logins(): Promise<Plan> {
  const keys = await kvSetMembers("jewelstone:accounts");
  const accounts = await Promise.all(
    keys.map((key) => kvGet<{ phone?: string }>(`jewelstone:account:${key}`)),
  );
  const phones = accounts
    .map((account) => (account?.phone ?? "").replace(/\D/g, ""))
    .map((digits) => (digits.length > 10 ? digits.slice(-10) : digits))
    .filter(Boolean)
    .map((digits) => `jewelstone:account-phone:${digits}`);
  return {
    keys: [...keys.map((key) => `jewelstone:account:${key}`), ...phones],
    indexes: ["jewelstone:accounts"],
    summary: `${keys.length} customer logins (${phones.length} phone pointers)`,
  };
}

const SECTIONS: Record<string, () => Promise<Plan>> = {
  orders: plan_orders,
  customers: plan_customers,
  kyc: plan_kyc,
  inbox: plan_inbox,
  documents: plan_documents,
  promotions: plan_promotions,
  operations: plan_operations,
};

const DEFAULT_SECTIONS = Object.keys(SECTIONS);

function parseArgs(argv: string[]) {
  const only = argv.find((arg) => arg.startsWith("--only="));
  const requested = only
    ? only.slice("--only=".length).split(",").map((name) => name.trim()).filter(Boolean)
    : DEFAULT_SECTIONS;
  return {
    sections: requested,
    confirmed: argv.includes("--yes") || argv.includes("--confirm"),
    withLogins: argv.includes("--with-logins"),
    resetCounters: argv.includes("--reset-counters"),
  };
}

async function main() {
  const { sections, confirmed, withLogins, resetCounters } = parseArgs(process.argv.slice(2));

  const unknown = sections.filter((name) => !(name in SECTIONS));
  if (unknown.length) {
    console.error(`Unknown section(s): ${unknown.join(", ")}`);
    console.error(`Available: ${DEFAULT_SECTIONS.join(", ")}`);
    process.exitCode = 1;
    return;
  }

  const store = kvConfigured
    ? `Upstash Redis at ${process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL}`
    : `local file ${process.env.ADMIN_STORE_FILE ?? ".data/admin-store.json"}`;
  console.log(`\nStore: ${store}`);
  console.log(confirmed ? "Mode:  DELETING\n" : "Mode:  dry run — nothing will be deleted (pass --yes to apply)\n");

  const plans: { name: string; plan: Plan }[] = [];
  for (const name of sections) {
    plans.push({ name, plan: await SECTIONS[name]().catch((error) => {
      console.error(`  ${name}: could not be read — ${error instanceof Error ? error.message : error}`);
      return EMPTY;
    }) });
  }
  if (withLogins) plans.push({ name: "logins", plan: await plan_logins() });

  for (const { name, plan } of plans) {
    console.log(`  ${name.padEnd(12)} ${plan.summary}`);
  }

  const totalKeys = plans.reduce((sum, { plan }) => sum + plan.keys.length, 0);
  const totalIndexes = plans.reduce((sum, { plan }) => sum + plan.indexes.length, 0);
  const allCounters = plans.flatMap(({ plan }) => plan.counters ?? []);
  console.log(`\n  ${totalKeys} keys and ${totalIndexes} index sets in scope.`);

  if (allCounters.length) {
    console.log(
      resetCounters
        ? `\nNumbering restarts at 1 (${allCounters.join(", ")}).`
        : `\nNumbering continues from where it is. Pass --reset-counters to restart at 1` +
          `\n  (${allCounters.join(", ")}) — only safe if no paperwork has gone out.`,
    );
  }

  console.log("\nKept (never deleted by this script):");
  for (const [key, why] of KEPT) console.log(`  ${key}\n    ${why}`);
  if (!withLogins) {
    console.log("  Pass --with-logins to clear customer portal logins as well.");
  }

  if (!confirmed) {
    console.log("\nDry run complete. Re-run with --yes to delete.\n");
    return;
  }

  if (!totalKeys && !totalIndexes) {
    console.log("\nNothing to delete.\n");
    return;
  }

  console.log("\nDeleting…");
  let deleted = 0;
  for (const { name, plan } of plans) {
    for (const key of plan.keys) {
      await kvDel(key);
      deleted += 1;
    }
    // Index sets go last, so an interrupted run leaves records still reachable
    // (and re-runnable) rather than orphaned.
    for (const index of plan.indexes) await kvDel(index);
    if (resetCounters) for (const counter of plan.counters ?? []) await kvDel(counter);
    console.log(`  ${name.padEnd(12)} cleared`);
  }
  console.log(
    `\nDeleted ${deleted} keys and ${totalIndexes} index sets` +
      `${resetCounters && allCounters.length ? `, and reset ${allCounters.length} counters` : ""}.\n`,
  );

  if (!kvConfigured) {
    console.log("Local store only. Custom requests also keep a copy in");
    console.log(".data/custom-requests.json — delete that file too if you cleared the inbox.\n");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

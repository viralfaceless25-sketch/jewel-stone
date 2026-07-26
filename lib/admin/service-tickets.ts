import "server-only";

import {
  kvGet,
  kvGetMany,
  kvIncrBy,
  kvSet,
  kvSetAdd,
  kvSetMembers,
} from "@/lib/kv";
import {
  SERVICE_STATUSES,
  type ServiceStatus,
  type ServiceTicket,
  type ServiceTicketDraft,
} from "./service-shared";

export type { ServiceStatus, ServiceTicket, ServiceTicketDraft } from "./service-shared";

const indexKey = "jewelstone:service-tickets";
const recordKey = (id: string) => `jewelstone:service-ticket:${id}`;

function text(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

function date(value: unknown, fallback = "") {
  const result = text(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(result) ? result : fallback;
}

function status(value: unknown): ServiceStatus {
  return typeof value === "string" && SERVICE_STATUSES.includes(value as ServiceStatus)
    ? value as ServiceStatus
    : "received";
}

function cost(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0
    ? Math.min(1_000_000_000, Math.round(amount))
    : 0;
}

export async function createServiceTicket(draft: ServiceTicketDraft) {
  const customerName = text(draft.customerName, 160);
  const item = text(draft.item, 240);
  const service = text(draft.service, 2000);
  if (!customerName || !item || !service) throw new Error("Customer, item, and service are required.");
  const now = new Date().toISOString();
  const sequence = await kvIncrBy("jewelstone:counter:service-ticket", 1);
  const ticket: ServiceTicket = {
    id: `REP-${String(sequence).padStart(5, "0")}`,
    customerName,
    email: text(draft.email, 160),
    phone: text(draft.phone, 80),
    item,
    service,
    intakeDate: date(draft.intakeDate, now.slice(0, 10)),
    dueDate: date(draft.dueDate),
    estimatedCost: cost(draft.estimatedCost),
    status: status(draft.status),
    notes: text(draft.notes, 5000),
    createdAt: now,
    updatedAt: now,
  };
  await kvSet(recordKey(ticket.id), ticket);
  await kvSetAdd(indexKey, ticket.id);
  return ticket;
}

export const getServiceTicket = (id: string) => kvGet<ServiceTicket>(recordKey(id));

export async function listServiceTickets() {
  const ids = await kvSetMembers(indexKey);
  const rows = await kvGetMany<ServiceTicket>(ids.map(recordKey));
  return rows
    .filter((row): row is ServiceTicket => Boolean(row))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateServiceTicket(id: string, draft: ServiceTicketDraft) {
  const current = await getServiceTicket(id);
  if (!current) return null;
  const next: ServiceTicket = {
    ...current,
    customerName: draft.customerName === undefined ? current.customerName : text(draft.customerName, 160),
    email: draft.email === undefined ? current.email : text(draft.email, 160),
    phone: draft.phone === undefined ? current.phone : text(draft.phone, 80),
    item: draft.item === undefined ? current.item : text(draft.item, 240),
    service: draft.service === undefined ? current.service : text(draft.service, 2000),
    intakeDate: draft.intakeDate === undefined ? current.intakeDate : date(draft.intakeDate, current.intakeDate),
    dueDate: draft.dueDate === undefined ? current.dueDate : date(draft.dueDate),
    estimatedCost: draft.estimatedCost === undefined ? current.estimatedCost : cost(draft.estimatedCost),
    status: draft.status === undefined ? current.status : status(draft.status),
    notes: draft.notes === undefined ? current.notes : text(draft.notes, 5000),
    updatedAt: new Date().toISOString(),
  };
  if (!next.customerName || !next.item || !next.service) {
    throw new Error("Customer, item, and service are required.");
  }
  await kvSet(recordKey(id), next);
  return next;
}

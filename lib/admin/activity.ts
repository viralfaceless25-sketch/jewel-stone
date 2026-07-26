import "server-only";

import { randomUUID } from "node:crypto";
import { kvGetMany, kvSet, kvSetAdd, kvSetMembers } from "@/lib/kv";

export type ActivityRecord = {
  id: string;
  action: string;
  subject: string;
  detail: string;
  createdAt: string;
};

const indexKey = "jewelstone:activity";
const recordKey = (id: string) => `jewelstone:activity:${id}`;

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

export async function recordActivity(action: string, subject: string, detail = "") {
  const record: ActivityRecord = {
    id: randomUUID(),
    action: clean(action, 80) || "Updated",
    subject: clean(subject, 180) || "Admin record",
    detail: clean(detail, 500),
    createdAt: new Date().toISOString(),
  };
  await kvSet(recordKey(record.id), record);
  await kvSetAdd(indexKey, record.id);
  return record;
}

export async function listActivity(limit = 100) {
  const ids = await kvSetMembers(indexKey);
  const rows = await kvGetMany<ActivityRecord>(ids.map(recordKey));
  return rows
    .filter((row): row is ActivityRecord => Boolean(row))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, Math.max(1, Math.min(500, limit)));
}

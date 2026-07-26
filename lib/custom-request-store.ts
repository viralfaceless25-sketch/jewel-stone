import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CustomRequestRecord } from "@/lib/custom-request-types";
import { kvGetMany, kvSet, kvSetAdd, kvSetMembers } from "@/lib/kv";

type LocalCollection = Record<string, CustomRequestRecord>;

const KV_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const LOCAL_STORE = process.env.CUSTOM_REQUESTS_FILE ?? path.join(process.cwd(), ".data", "custom-requests.json");

let localWriteQueue: Promise<void> = Promise.resolve();

export class CustomRequestStoreError extends Error {
  constructor(message: "custom_request_store_unconfigured" | "custom_request_store_failed") {
    super(message);
    this.name = "CustomRequestStoreError";
  }
}

function recordKey(id: string) {
  return `jewelstone:custom-request:${id}`;
}

function publicKey(token: string) {
  return `jewelstone:custom-public:${token}`;
}

function ownerKey(token: string) {
  return `jewelstone:custom-owner:${token}`;
}

async function kvCommand(command: string[]) {
  if (!KV_URL || !KV_TOKEN) throw new CustomRequestStoreError("custom_request_store_unconfigured");
  const response = await fetch(KV_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({})) as { result?: unknown; error?: string };
  if (!response.ok || body.error) {
    console.error("custom request store failed", response.status, body.error ?? "unknown error");
    throw new CustomRequestStoreError("custom_request_store_failed");
  }
  return body.result;
}

async function readLocalCollection(): Promise<LocalCollection> {
  try {
    return JSON.parse(await readFile(LOCAL_STORE, "utf8")) as LocalCollection;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    console.error("custom request local store could not be read", error);
    throw new CustomRequestStoreError("custom_request_store_failed");
  }
}

async function writeLocalRecord(record: CustomRequestRecord) {
  await mkdir(path.dirname(LOCAL_STORE), { recursive: true });
  const collection = await readLocalCollection();
  collection[record.id] = record;
  const temporary = `${LOCAL_STORE}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(collection, null, 2)}\n`, { mode: 0o600 });
  await rename(temporary, LOCAL_STORE);
}

async function saveLocalRecord(record: CustomRequestRecord) {
  localWriteQueue = localWriteQueue.catch(() => undefined).then(() => writeLocalRecord(record));
  await localWriteQueue;
}

function requireProductionStore() {
  if (!KV_URL || !KV_TOKEN) {
    if (process.env.NODE_ENV === "production") {
      throw new CustomRequestStoreError("custom_request_store_unconfigured");
    }
    return false;
  }
  return true;
}

export async function saveCustomRequest(record: CustomRequestRecord) {
  if (requireProductionStore()) {
    await Promise.all([
      kvCommand(["SET", recordKey(record.id), JSON.stringify(record)]),
      kvCommand(["SET", publicKey(record.publicToken), record.id]),
      kvCommand(["SET", ownerKey(record.ownerToken), record.id]),
    ]);
    await kvSetAdd("jewelstone:custom-requests", record.id);
    return;
  }
  await saveLocalRecord(record);
  await kvSet(recordKey(record.id), record);
  await kvSetAdd("jewelstone:custom-requests", record.id);
}

async function getRemoteRecord(indexKey: string) {
  const id = await kvCommand(["GET", indexKey]);
  if (typeof id !== "string") return null;
  const serialized = await kvCommand(["GET", recordKey(id)]);
  if (typeof serialized !== "string") return null;
  try {
    return JSON.parse(serialized) as CustomRequestRecord;
  } catch {
    throw new CustomRequestStoreError("custom_request_store_failed");
  }
}

export async function getCustomRequestByPublicToken(token: string) {
  if (requireProductionStore()) return getRemoteRecord(publicKey(token));
  const collection = await readLocalCollection();
  return Object.values(collection).find((record) => record.publicToken === token) ?? null;
}

export async function getCustomRequestByOwnerToken(token: string) {
  if (requireProductionStore()) return getRemoteRecord(ownerKey(token));
  const collection = await readLocalCollection();
  return Object.values(collection).find((record) => record.ownerToken === token) ?? null;
}

export async function listCustomRequests() {
  const ids = await kvSetMembers("jewelstone:custom-requests");
  const rows = await kvGetMany<CustomRequestRecord>(ids.map(recordKey));
  return rows
    .filter((row): row is CustomRequestRecord => Boolean(row))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

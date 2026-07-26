import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

// Shared Upstash Redis (REST) helper for every admin/back-office feature.
// Mirrors the pattern proven in lib/custom-request-store.ts, plus a local JSON
// fallback so `npm run dev` works with no cloud store configured.

const KV_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const LOCAL_STORE = process.env.ADMIN_STORE_FILE ?? path.join(process.cwd(), ".data", "admin-store.json");

export const kvConfigured = Boolean(KV_URL && KV_TOKEN);

export class KvError extends Error {
  constructor(message: "kv_unconfigured" | "kv_failed") {
    super(message);
    this.name = "KvError";
  }
}

type LocalShape = { values: Record<string, string>; sets: Record<string, string[]> };
let writeQueue: Promise<void> = Promise.resolve();

async function readLocal(): Promise<LocalShape> {
  try {
    const parsed = JSON.parse(await readFile(LOCAL_STORE, "utf8")) as Partial<LocalShape>;
    return { values: parsed.values ?? {}, sets: parsed.sets ?? {} };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { values: {}, sets: {} };
    throw new KvError("kv_failed");
  }
}

async function writeLocal(mutate: (data: LocalShape) => void) {
  writeQueue = writeQueue.catch(() => undefined).then(async () => {
    const data = await readLocal();
    mutate(data);
    await mkdir(path.dirname(LOCAL_STORE), { recursive: true });
    const temp = `${LOCAL_STORE}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(temp, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
    await rename(temp, LOCAL_STORE);
  });
  await writeQueue;
}

async function command(cmd: (string | number)[]): Promise<unknown> {
  if (!KV_URL || !KV_TOKEN) throw new KvError("kv_unconfigured");
  const response = await fetch(KV_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd.map(String)),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as { result?: unknown; error?: string };
  if (!response.ok || body.error) {
    console.error("kv command failed", cmd[0], response.status, body.error ?? "unknown error");
    throw new KvError("kv_failed");
  }
  return body.result;
}

export async function kvGet<T>(key: string): Promise<T | null> {
  if (!kvConfigured) {
    const raw = (await readLocal()).values[key];
    return raw ? (JSON.parse(raw) as T) : null;
  }
  const raw = (await command(["GET", key])) as string | null;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  const raw = JSON.stringify(value);
  if (!kvConfigured) {
    await writeLocal((data) => { data.values[key] = raw; });
    return;
  }
  await command(["SET", key, raw]);
}

export async function kvDel(key: string): Promise<void> {
  if (!kvConfigured) {
    await writeLocal((data) => { delete data.values[key]; });
    return;
  }
  await command(["DEL", key]);
}

/** Atomic counter — used for stock and for invoice/memo numbering. */
export async function kvIncrBy(key: string, amount: number): Promise<number> {
  if (!kvConfigured) {
    let next = 0;
    await writeLocal((data) => {
      next = Number(data.values[key] ?? "0") + amount;
      data.values[key] = JSON.stringify(next);
    });
    return next;
  }
  return Number(await command(["INCRBY", key, amount]));
}

export async function kvSetAdd(key: string, member: string): Promise<void> {
  if (!kvConfigured) {
    await writeLocal((data) => {
      const set = new Set(data.sets[key] ?? []);
      set.add(member);
      data.sets[key] = [...set];
    });
    return;
  }
  await command(["SADD", key, member]);
}

export async function kvSetRemove(key: string, member: string): Promise<void> {
  if (!kvConfigured) {
    await writeLocal((data) => {
      data.sets[key] = (data.sets[key] ?? []).filter((m) => m !== member);
    });
    return;
  }
  await command(["SREM", key, member]);
}

export async function kvSetMembers(key: string): Promise<string[]> {
  if (!kvConfigured) return (await readLocal()).sets[key] ?? [];
  return ((await command(["SMEMBERS", key])) as string[] | null) ?? [];
}

/** Fetch many JSON values at once (falls back to sequential GETs locally). */
export async function kvGetMany<T>(keys: string[]): Promise<(T | null)[]> {
  if (!keys.length) return [];
  if (!kvConfigured) {
    const { values } = await readLocal();
    return keys.map((key) => {
      const raw = values[key];
      if (!raw) return null;
      try { return JSON.parse(raw) as T; } catch { return null; }
    });
  }
  const raws = ((await command(["MGET", ...keys])) as (string | null)[] | null) ?? [];
  return raws.map((raw) => {
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  });
}

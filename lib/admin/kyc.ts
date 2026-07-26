import "server-only";

import { randomUUID } from "node:crypto";
import { kvGet, kvGetMany, kvSet, kvSetAdd, kvSetMembers, kvSetRemove } from "@/lib/kv";
import { customerKey } from "./order-items";
import {
  canApprove,
  emptyKycRecord,
  type KycBusiness,
  type KycFile,
  type KycFileKind,
  type KycRecord,
  type KycStatus,
} from "./kyc-shared";

// Storage for Know Your Customer records. The owner sends a branded KYC form to
// a trade customer, the customer returns it signed with two proofs of identity,
// and the owner uploads both here to approve the account. Memo (consignment)
// issuing leans on this: goods leave the premises, so the paperwork must exist.

export * from "./kyc-shared";

const KYC_INDEX = "jewelstone:kyc";
const recordKey = (email: string) => `jewelstone:kyc:${customerKey(email)}`;
// File payloads live under their own keys so the record itself stays small.
const fileKey = (id: string) => `jewelstone:kyc-file:${id}`;

export async function getKyc(email: string): Promise<KycRecord | null> {
  return kvGet<KycRecord>(recordKey(email));
}

export async function getKycOrEmpty(email: string): Promise<KycRecord> {
  return (await getKyc(email)) ?? emptyKycRecord(email);
}

export async function listKyc(): Promise<KycRecord[]> {
  const keys = await kvSetMembers(KYC_INDEX);
  if (!keys.length) return [];
  const rows = await kvGetMany<KycRecord>(keys.map((key) => `jewelstone:kyc:${key}`));
  return rows
    .filter((row): row is KycRecord => row !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function persist(record: KycRecord) {
  const next: KycRecord = { ...record, updatedAt: new Date().toISOString() };
  await kvSet(recordKey(record.email), next);
  await kvSetAdd(KYC_INDEX, customerKey(record.email));
  return next;
}

export async function saveKyc(
  email: string,
  patch: Partial<Pick<KycRecord, "business" | "notes" | "expiresAt">>,
) {
  const current = await getKycOrEmpty(email);
  return persist({
    ...current,
    business: patch.business ? { ...current.business, ...patch.business } : current.business,
    notes: patch.notes ?? current.notes,
    expiresAt: patch.expiresAt ?? current.expiresAt,
  });
}

export async function setKycStatus(email: string, status: KycStatus) {
  const current = await getKycOrEmpty(email);
  if (status === "approved" && !canApprove(current)) {
    throw new Error("kyc_incomplete");
  }
  const now = new Date().toISOString();
  return persist({
    ...current,
    status,
    ...(status === "sent" ? { sentAt: now } : {}),
    ...(status === "received" ? { receivedAt: now } : {}),
    ...(status === "approved" ? { approvedAt: now } : {}),
    ...(status === "rejected" ? { rejectedAt: now } : {}),
  });
}

export async function addKycFile(
  email: string,
  file: { kind: KycFileKind; label: string; fileName: string; mimeType: string; dataUrl: string },
) {
  const current = await getKycOrEmpty(email);
  const entry: KycFile = {
    id: randomUUID(),
    kind: file.kind,
    label: file.label,
    fileName: file.fileName,
    mimeType: file.mimeType,
    size: file.dataUrl.length,
    uploadedAt: new Date().toISOString(),
  };
  await kvSet(fileKey(entry.id), file.dataUrl);
  // Receiving paperwork moves an untouched or sent record forward automatically.
  const status: KycStatus = current.status === "approved" || current.status === "rejected"
    ? current.status
    : "received";
  return persist({ ...current, status, files: [...current.files, entry] });
}

export async function removeKycFile(email: string, fileId: string) {
  const current = await getKycOrEmpty(email);
  await kvSet(fileKey(fileId), null);
  return persist({ ...current, files: current.files.filter((file) => file.id !== fileId) });
}

export async function getKycFileData(fileId: string) {
  return kvGet<string>(fileKey(fileId));
}

export async function deleteKyc(email: string) {
  const current = await getKyc(email);
  if (current) {
    await Promise.all(current.files.map((file) => kvSet(fileKey(file.id), null)));
  }
  await kvSet(recordKey(email), null);
  await kvSetRemove(KYC_INDEX, customerKey(email));
}

export type { KycBusiness };

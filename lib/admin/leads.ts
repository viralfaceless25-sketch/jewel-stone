import "server-only";

import { randomUUID } from "node:crypto";
import { kvDel, kvGet, kvGetMany, kvSet, kvSetAdd, kvSetMembers, kvSetRemove } from "@/lib/kv";

export type InquiryRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: "new" | "contacted" | "closed";
  name: string;
  email: string;
  phone: string;
  context: string;
  message: string;
  referenceFiles: string[];
};

export type AppointmentRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: "new" | "confirmed" | "completed" | "cancelled";
  name: string;
  email: string;
  phone: string;
  requestedDate: string;
  requestedTime: string;
  interest: string;
  notes: string;
};

const inquiryIndex = "jewelstone:inquiries";
const appointmentIndex = "jewelstone:appointments";
const inquiryKey = (id: string) => `jewelstone:inquiry:${id}`;
const appointmentKey = (id: string) => `jewelstone:appointment:${id}`;

export async function saveInquiry(
  input: Omit<InquiryRecord, "id" | "createdAt" | "updatedAt" | "status">,
) {
  const now = new Date().toISOString();
  const record: InquiryRecord = {
    ...input,
    id: `INQ-${randomUUID().slice(0, 8).toUpperCase()}`,
    createdAt: now,
    updatedAt: now,
    status: "new",
  };
  await kvSet(inquiryKey(record.id), record);
  await kvSetAdd(inquiryIndex, record.id);
  return record;
}

export async function saveAppointment(
  input: Omit<AppointmentRecord, "id" | "createdAt" | "updatedAt" | "status">,
) {
  const now = new Date().toISOString();
  const record: AppointmentRecord = {
    ...input,
    id: `APT-${randomUUID().slice(0, 8).toUpperCase()}`,
    createdAt: now,
    updatedAt: now,
    status: "new",
  };
  await kvSet(appointmentKey(record.id), record);
  await kvSetAdd(appointmentIndex, record.id);
  return record;
}

async function list<T>(index: string, key: (id: string) => string) {
  const ids = await kvSetMembers(index);
  const rows = await kvGetMany<T>(ids.map(key));
  return rows.filter((row): row is T => Boolean(row));
}

export async function listInquiries() {
  return (await list<InquiryRecord>(inquiryIndex, inquiryKey))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listAppointments() {
  return (await list<AppointmentRecord>(appointmentIndex, appointmentKey))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateInquiryStatus(id: string, status: InquiryRecord["status"]) {
  const current = await kvGet<InquiryRecord>(inquiryKey(id));
  if (!current) return null;
  const next = { ...current, status, updatedAt: new Date().toISOString() };
  await kvSet(inquiryKey(id), next);
  return next;
}

export async function updateAppointmentStatus(id: string, status: AppointmentRecord["status"]) {
  const current = await kvGet<AppointmentRecord>(appointmentKey(id));
  if (!current) return null;
  const next = { ...current, status, updatedAt: new Date().toISOString() };
  await kvSet(appointmentKey(id), next);
  return next;
}

export async function deleteInquiry(id: string) {
  await kvDel(inquiryKey(id));
  await kvSetRemove(inquiryIndex, id);
}

export async function deleteAppointment(id: string) {
  await kvDel(appointmentKey(id));
  await kvSetRemove(appointmentIndex, id);
}


import "server-only";

import { randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { kvGet, kvSet, kvSetAdd, kvSetMembers, kvSetRemove, kvGetMany } from "@/lib/kv";
import { customerKey } from "@/lib/admin/order-items";
import {
  createCustomerSessionToken,
  parseCustomerSessionToken,
} from "./customer-session";

// Trade-customer logins. The owner creates an account from the admin panel using
// the e-mail or mobile the customer gave on their KYC form, hands over the
// one-time password, and the customer signs in to see their own orders,
// invoices, memoranda, and KYC status. Entirely separate from the admin session.

export const CUSTOMER_COOKIE = "js_customer";
const SESSION_DAYS = 30;
const ACCOUNT_INDEX = "jewelstone:accounts";

const accountKey = (identifier: string) => `jewelstone:account:${customerKey(identifier)}`;
// Phone numbers get their own pointer so a customer can sign in with either.
const phonePointerKey = (phone: string) => `jewelstone:account-phone:${normalizePhone(phone)}`;

export type CustomerAccount = {
  email: string;
  phone: string;
  name: string;
  passwordHash: string;
  passwordSalt: string;
  /** Set when the owner issues a temporary password the customer must change. */
  mustChangePassword: boolean;
  disabled: boolean;
  /** Incrementing this revokes every session minted before the change. */
  tokenVersion: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
};

/** Digits only, so "+1 (551) 341-3256" and "5513413256" resolve to one account. */
export function normalizePhone(phone: string) {
  const digits = (phone || "").replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function hash(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/** Readable one-time password the owner can pass on by phone. */
export function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 12 }, () => alphabet[randomInt(alphabet.length)]).join("");
}

export async function getAccount(identifier: string): Promise<CustomerAccount | null> {
  const direct = await kvGet<CustomerAccount>(accountKey(identifier));
  if (direct) return direct;
  // Not an e-mail match — try the phone pointer.
  const digits = normalizePhone(identifier);
  if (!digits) return null;
  const email = await kvGet<string>(phonePointerKey(digits));
  return email ? kvGet<CustomerAccount>(accountKey(email)) : null;
}

export async function listAccounts(): Promise<CustomerAccount[]> {
  const keys = await kvSetMembers(ACCOUNT_INDEX);
  if (!keys.length) return [];
  const rows = await kvGetMany<CustomerAccount>(keys.map((key) => `jewelstone:account:${key}`));
  return rows
    .filter((row): row is CustomerAccount => row !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function persist(account: CustomerAccount) {
  const next = {
    ...account,
    tokenVersion: accountVersion(account),
    updatedAt: new Date().toISOString(),
  };
  await kvSet(accountKey(next.email), next);
  await kvSetAdd(ACCOUNT_INDEX, customerKey(next.email));
  const digits = normalizePhone(next.phone);
  if (digits) await kvSet(phonePointerKey(digits), next.email);
  return next;
}

function accountVersion(account: Partial<CustomerAccount> | null | undefined) {
  const version = Number(account?.tokenVersion);
  return Number.isInteger(version) && version > 0 ? version : 1;
}

/**
 * Create a login for a customer, or reissue the password for an existing one.
 * Returns the plaintext password exactly once so the owner can pass it on; it is
 * never recoverable afterwards.
 */
export async function createAccount(input: { email: string; phone?: string; name?: string }) {
  const email = input.email.trim().toLowerCase();
  const existing = await kvGet<CustomerAccount>(accountKey(email));
  const password = generatePassword();
  const salt = randomBytes(16).toString("base64url");
  const now = new Date().toISOString();

  const account = await persist({
    email,
    phone: (input.phone ?? existing?.phone ?? "").trim(),
    name: (input.name ?? existing?.name ?? "").trim(),
    passwordHash: hash(password, salt),
    passwordSalt: salt,
    mustChangePassword: true,
    disabled: false,
    tokenVersion: existing ? accountVersion(existing) + 1 : 1,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    ...(existing?.lastLoginAt ? { lastLoginAt: existing.lastLoginAt } : {}),
  });
  return { account, password, reissued: Boolean(existing) };
}

export async function setAccountDisabled(email: string, disabled: boolean) {
  const account = await kvGet<CustomerAccount>(accountKey(email.trim().toLowerCase()));
  if (!account) return null;
  return persist({ ...account, disabled, tokenVersion: accountVersion(account) + 1 });
}

export async function deleteAccount(email: string) {
  const key = email.trim().toLowerCase();
  const account = await kvGet<CustomerAccount>(accountKey(key));
  if (account?.phone) {
    const digits = normalizePhone(account.phone);
    if (digits) await kvSet(phonePointerKey(digits), null);
  }
  await kvSet(accountKey(key), null);
  await kvSetRemove(ACCOUNT_INDEX, customerKey(key));
}

/** Customer chooses their own password after the one-time sign-in. */
export async function changePassword(email: string, password: string) {
  const account = await kvGet<CustomerAccount>(accountKey(email.trim().toLowerCase()));
  if (!account) return null;
  const salt = randomBytes(16).toString("base64url");
  return persist({
    ...account,
    passwordHash: hash(password, salt),
    passwordSalt: salt,
    mustChangePassword: false,
    tokenVersion: accountVersion(account) + 1,
  });
}

export async function verifyCredentials(identifier: string, password: string) {
  const account = await getAccount(identifier.trim().toLowerCase());
  if (!account || account.disabled) return null;
  if (!safeEqual(hash(password, account.passwordSalt), account.passwordHash)) return null;
  return persist({ ...account, lastLoginAt: new Date().toISOString() });
}

// ── Session cookie ───────────────────────────────────────────────────────────
function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? null;
}

export function createCustomerSession(email: string, tokenVersion: number) {
  const key = sessionSecret();
  if (!key) return null;
  return createCustomerSessionToken(
    email,
    tokenVersion,
    key,
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  );
}

/** Returns the signed-in customer's e-mail, or null. */
export async function readCustomerSession(token: string | undefined) {
  const claims = parseCustomerSessionToken(token, sessionSecret());
  if (!claims) return null;
  const account = await getAccount(claims.email);
  if (
    !account ||
    account.disabled ||
    accountVersion(account) !== claims.tokenVersion
  ) {
    return null;
  }
  return account.email;
}

export function customerCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}

export async function currentCustomerEmail() {
  return readCustomerSession(cookies().get(CUSTOMER_COOKIE)?.value);
}

/** Guard for customer-facing API routes. */
export async function requireCustomerApi() {
  const email = await currentCustomerEmail();
  if (!email) return { email: null, denied: Response.json({ error: "Please sign in." }, { status: 401 }) };
  return { email, denied: null };
}

import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Admin access is a single shared password (the owner is the only operator).
// A correct password mints a signed, HTTP-only cookie; every admin page and API
// verifies it. With no ADMIN_PASSWORD configured the panel stays closed.

export const ADMIN_COOKIE = "js_admin";
const SESSION_DAYS = 7;

function secret() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return process.env.ADMIN_SESSION_SECRET ?? `jewelstone:${password}`;
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function sign(payload: string, key: string) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function passwordMatches(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(candidate, expected);
}

/** `<expiresAt>.<signature>` — no secrets or identity inside the cookie. */
export function createSessionToken() {
  const key = secret();
  if (!key) return null;
  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload, key)}`;
}

export function verifySessionToken(token: string | undefined) {
  const key = secret();
  if (!key || !token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  if (!safeEqual(signature, sign(payload, key))) return false;
  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}

/** True when the current request carries a valid admin session. */
export function isAdminAuthenticated() {
  return verifySessionToken(cookies().get(ADMIN_COOKIE)?.value);
}

/** Guard for admin API routes. Returns null when allowed, else a Response. */
export function requireAdminApi() {
  if (!adminConfigured()) {
    return Response.json({ error: "Admin panel is not configured." }, { status: 503 });
  }
  if (!isAdminAuthenticated()) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }
  return null;
}

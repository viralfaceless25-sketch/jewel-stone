import { createHash } from "node:crypto";
import { cookies, headers } from "next/headers";
import {
  CUSTOMER_COOKIE,
  createCustomerSession,
  customerCookieOptions,
  verifyCredentials,
} from "@/lib/account/customer-auth";
import { KvError, kvConsumeLimit, kvDel } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Customers sign in with the e-mail or mobile they gave on their KYC form. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    identifier?: unknown;
    password?: unknown;
  };
  const identifier = typeof body.identifier === "string" ? body.identifier.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!identifier || !password) {
    return Response.json({ error: "Enter your e-mail or mobile and your password." }, { status: 400 });
  }

  const address =
    headers().get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers().get("x-real-ip") ||
    "unknown";
  const digest = (value: string) =>
    createHash("sha256").update(value.trim().toLowerCase()).digest("hex").slice(0, 32);
  const ipLimitKey = `jewelstone:login-limit:ip:${digest(address)}`;
  const accountLimitKey = `jewelstone:login-limit:account:${digest(identifier)}`;
  let ipLimit;
  let accountLimit;
  try {
    [ipLimit, accountLimit] = await Promise.all([
      kvConsumeLimit(ipLimitKey, 30, 300),
      kvConsumeLimit(accountLimitKey, 8, 300),
    ]);
  } catch (error) {
    if (error instanceof KvError) {
      return Response.json({ error: "Sign-in is temporarily unavailable." }, { status: 503 });
    }
    throw error;
  }
  if (!ipLimit.allowed || !accountLimit.allowed) {
    const retryAfter = Math.max(ipLimit.retryAfter, accountLimit.retryAfter);
    return Response.json(
      { error: "Too many attempts. Wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const account = await verifyCredentials(identifier, password);
  if (!account) {
    // Deliberately vague: never reveal whether the account exists.
    return Response.json({ error: "Those details don't match an account." }, { status: 401 });
  }

  await Promise.all([kvDel(ipLimitKey), kvDel(accountLimitKey)]);
  const token = createCustomerSession(account.email, account.tokenVersion);
  if (!token) {
    return Response.json({ error: "Accounts are not configured yet." }, { status: 503 });
  }
  cookies().set(CUSTOMER_COOKIE, token, customerCookieOptions());
  return Response.json({ ok: true, mustChangePassword: account.mustChangePassword });
}

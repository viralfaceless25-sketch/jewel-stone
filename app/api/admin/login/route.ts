import { createHash } from "node:crypto";
import { cookies, headers } from "next/headers";
import {
  ADMIN_COOKIE,
  adminConfigured,
  createSessionToken,
  passwordMatches,
  sessionCookieOptions,
} from "@/lib/admin/auth";
import { KvError, kvConsumeLimit, kvDel } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!adminConfigured()) {
    return Response.json({ error: "Admin access is not configured." }, { status: 503 });
  }

  const address =
    headers().get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers().get("x-real-ip") ||
    "unknown";
  const addressHash = createHash("sha256").update(address).digest("hex").slice(0, 32);
  const limitKey = `jewelstone:admin-login-limit:${addressHash}`;
  let limit;
  try {
    limit = await kvConsumeLimit(limitKey, 8, 300);
  } catch (error) {
    if (error instanceof KvError) {
      return Response.json({ error: "Owner sign-in is temporarily unavailable." }, { status: 503 });
    }
    throw error;
  }
  if (!limit.allowed) {
    return Response.json(
      { error: "Too many attempts. Wait a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const body = (await request.json().catch(() => ({}))) as { password?: unknown };
  const password = typeof body.password === "string" ? body.password : "";
  if (!passwordMatches(password)) {
    return Response.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = createSessionToken();
  if (!token) return Response.json({ error: "Could not create session." }, { status: 500 });
  await kvDel(limitKey);
  cookies().set(ADMIN_COOKIE, token, sessionCookieOptions());
  return Response.json({ ok: true });
}

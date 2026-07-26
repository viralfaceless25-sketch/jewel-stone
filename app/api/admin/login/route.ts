import { cookies, headers } from "next/headers";
import {
  ADMIN_COOKIE,
  adminConfigured,
  createSessionToken,
  passwordMatches,
  sessionCookieOptions,
} from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const windowMs = 60_000;
const maxAttempts = 8;
const attempts = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: Request) {
  if (!adminConfigured()) {
    return Response.json({ error: "Admin access is not configured." }, { status: 503 });
  }

  const address =
    headers().get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers().get("x-real-ip") ||
    "unknown";
  const now = Date.now();
  const current = attempts.get(address);
  if (!current || current.resetAt <= now) attempts.set(address, { count: 1, resetAt: now + windowMs });
  else {
    current.count += 1;
    if (current.count > maxAttempts) {
      return Response.json({ error: "Too many attempts. Wait one minute." }, { status: 429 });
    }
  }

  const body = (await request.json().catch(() => ({}))) as { password?: unknown };
  const password = typeof body.password === "string" ? body.password : "";
  if (!passwordMatches(password)) {
    return Response.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = createSessionToken();
  if (!token) return Response.json({ error: "Could not create session." }, { status: 500 });
  attempts.delete(address);
  cookies().set(ADMIN_COOKIE, token, sessionCookieOptions());
  return Response.json({ ok: true });
}


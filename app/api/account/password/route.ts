import { cookies } from "next/headers";
import {
  CUSTOMER_COOKIE,
  changePassword,
  createCustomerSession,
  customerCookieOptions,
  requireCustomerApi,
} from "@/lib/account/customer-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Replaces the one-time password the owner issued. */
export async function POST(request: Request) {
  const { email, denied } = await requireCustomerApi();
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as { password?: unknown };
  const password = typeof body.password === "string" ? body.password : "";
  if (password.length < 8) {
    return Response.json({ error: "Choose a password of at least 8 characters." }, { status: 400 });
  }
  const account = await changePassword(email, password);
  if (!account) return Response.json({ error: "Account not found." }, { status: 404 });
  const token = createCustomerSession(account.email, account.tokenVersion);
  if (!token) return Response.json({ error: "Accounts are not configured yet." }, { status: 503 });
  cookies().set(CUSTOMER_COOKIE, token, customerCookieOptions());
  return Response.json({ ok: true });
}

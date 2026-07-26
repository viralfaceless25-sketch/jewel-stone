import { cookies } from "next/headers";
import {
  CUSTOMER_COOKIE,
  createCustomerSession,
  customerCookieOptions,
  verifyCredentials,
} from "@/lib/account/customer-auth";

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

  const account = await verifyCredentials(identifier, password);
  if (!account) {
    // Deliberately vague: never reveal whether the account exists.
    return Response.json({ error: "Those details don't match an account." }, { status: 401 });
  }

  const token = createCustomerSession(account.email);
  if (!token) {
    return Response.json({ error: "Accounts are not configured yet." }, { status: 503 });
  }
  cookies().set(CUSTOMER_COOKIE, token, customerCookieOptions());
  return Response.json({ ok: true, mustChangePassword: account.mustChangePassword });
}

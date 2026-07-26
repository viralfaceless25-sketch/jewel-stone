import { changePassword, requireCustomerApi } from "@/lib/account/customer-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Replaces the one-time password the owner issued. */
export async function POST(request: Request) {
  const { email, denied } = requireCustomerApi();
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as { password?: unknown };
  const password = typeof body.password === "string" ? body.password : "";
  if (password.length < 8) {
    return Response.json({ error: "Choose a password of at least 8 characters." }, { status: 400 });
  }
  const account = await changePassword(email, password);
  return account
    ? Response.json({ ok: true })
    : Response.json({ error: "Account not found." }, { status: 404 });
}

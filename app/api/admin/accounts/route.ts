import { requireAdminApi } from "@/lib/admin/auth";
import { createAccount, deleteAccount, listAccounts, setAccountDisabled } from "@/lib/account/customer-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Customer logins the owner has issued. Password hashes never leave the server. */
export async function GET() {
  const denied = requireAdminApi();
  if (denied) return denied;
  const accounts = await listAccounts();
  return Response.json({
    accounts: accounts.map(({ passwordHash: _hash, passwordSalt: _salt, ...rest }) => rest),
  });
}

export async function POST(request: Request) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as {
    email?: unknown;
    phone?: unknown;
    name?: unknown;
  };
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return Response.json({ error: "A valid e-mail address is required." }, { status: 400 });
  }

  const { account, password, reissued } = await createAccount({
    email,
    phone: typeof body.phone === "string" ? body.phone : undefined,
    name: typeof body.name === "string" ? body.name : undefined,
  });
  const { passwordHash: _hash, passwordSalt: _salt, ...safe } = account;
  // The plaintext password is returned once, for the owner to pass on.
  return Response.json({ account: safe, password, reissued }, { status: reissued ? 200 : 201 });
}

export async function PATCH(request: Request) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as { email?: unknown; disabled?: unknown };
  if (typeof body.email !== "string" || typeof body.disabled !== "boolean") {
    return Response.json({ error: "Which account should change?" }, { status: 400 });
  }
  const account = await setAccountDisabled(body.email, body.disabled);
  if (!account) return Response.json({ error: "Account not found." }, { status: 404 });
  const { passwordHash: _hash, passwordSalt: _salt, ...safe } = account;
  return Response.json({ account: safe });
}

export async function DELETE(request: Request) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const email = new URL(request.url).searchParams.get("email");
  if (!email) return Response.json({ error: "Which account should be removed?" }, { status: 400 });
  await deleteAccount(email);
  return Response.json({ ok: true });
}

import { cookies } from "next/headers";
import { CUSTOMER_COOKIE } from "@/lib/account/customer-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  cookies().delete(CUSTOMER_COOKIE);
  return Response.json({ ok: true });
}

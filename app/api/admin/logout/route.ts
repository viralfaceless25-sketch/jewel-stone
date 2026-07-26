import { cookies } from "next/headers";
import { ADMIN_COOKIE, sessionCookieOptions } from "@/lib/admin/auth";

export async function POST() {
  cookies().set(ADMIN_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return Response.json({ ok: true });
}

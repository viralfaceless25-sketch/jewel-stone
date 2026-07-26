import { requireAdminApi } from "@/lib/admin/auth";
import { recordActivity } from "@/lib/admin/activity";
import { getAdminSettings, saveAdminSettings } from "@/lib/admin/settings";

export async function GET() {
  const denied = requireAdminApi();
  if (denied) return denied;
  return Response.json({ settings: await getAdminSettings() });
}

export async function PATCH(request: Request) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const settings = await saveAdminSettings(body);
  await recordActivity("Updated settings", "Business & document defaults", settings.legalName);
  return Response.json({ settings });
}

import { requireAdminApi } from "@/lib/admin/auth";
import { recordActivity } from "@/lib/admin/activity";
import { updateAppointmentStatus, updateInquiryStatus } from "@/lib/admin/leads";

export async function PATCH(
  request: Request,
  { params }: { params: { type: string; id: string } },
) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as { status?: unknown };
  if (params.type === "inquiry" && ["new", "contacted", "closed"].includes(String(body.status))) {
    const record = await updateInquiryStatus(params.id, body.status as "new" | "contacted" | "closed");
    await recordActivity("Updated inquiry", params.id, String(body.status));
    return Response.json({ record });
  }
  if (params.type === "appointment" && ["new", "confirmed", "completed", "cancelled"].includes(String(body.status))) {
    const record = await updateAppointmentStatus(params.id, body.status as "new" | "confirmed" | "completed" | "cancelled");
    await recordActivity("Updated appointment", params.id, String(body.status));
    return Response.json({ record });
  }
  return Response.json({ error: "Invalid status." }, { status: 400 });
}

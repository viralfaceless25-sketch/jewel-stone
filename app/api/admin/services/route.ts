import { requireAdminApi } from "@/lib/admin/auth";
import { recordActivity } from "@/lib/admin/activity";
import {
  createServiceTicket,
  listServiceTickets,
  type ServiceTicketDraft,
} from "@/lib/admin/service-tickets";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = requireAdminApi();
  if (denied) return denied;
  return Response.json({ tickets: await listServiceTickets() });
}

export async function POST(request: Request) {
  const denied = requireAdminApi();
  if (denied) return denied;
  try {
    const body = (await request.json().catch(() => ({}))) as ServiceTicketDraft;
    const ticket = await createServiceTicket(body);
    await recordActivity("Created repair ticket", ticket.id, `${ticket.customerName} · ${ticket.item}`);
    return Response.json({ ticket }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not create service ticket." },
      { status: 400 },
    );
  }
}

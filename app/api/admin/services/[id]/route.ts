import { requireAdminApi } from "@/lib/admin/auth";
import { recordActivity } from "@/lib/admin/activity";
import {
  getServiceTicket,
  updateServiceTicket,
  type ServiceTicketDraft,
} from "@/lib/admin/service-tickets";

type Context = { params: { id: string } };

export async function GET(_request: Request, { params }: Context) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const ticket = await getServiceTicket(params.id);
  return ticket
    ? Response.json({ ticket })
    : Response.json({ error: "Service ticket not found." }, { status: 404 });
}

export async function PATCH(request: Request, { params }: Context) {
  const denied = requireAdminApi();
  if (denied) return denied;
  try {
    const body = (await request.json().catch(() => ({}))) as ServiceTicketDraft;
    const ticket = await updateServiceTicket(params.id, body);
    if (!ticket) return Response.json({ error: "Service ticket not found." }, { status: 404 });
    await recordActivity("Updated repair ticket", ticket.id, ticket.status.replaceAll("_", " "));
    return Response.json({ ticket });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not update service ticket." },
      { status: 400 },
    );
  }
}

import { requireAdminApi } from "@/lib/admin/auth";
import { deleteCustomRequest } from "@/lib/custom-request-store";

type Context = { params: { id: string } };

export async function DELETE(_request: Request, { params }: Context) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const deleted = await deleteCustomRequest(decodeURIComponent(params.id));
  return deleted
    ? Response.json({ ok: true })
    : Response.json({ error: "Request not found." }, { status: 404 });
}

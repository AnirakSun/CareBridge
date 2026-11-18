import { apiUnauthorized, apiValidation } from "@/lib/api-error";
import { getCurrentUser } from "@/server/session";
import { ROLES } from "@/lib/constants";
import {
  listStaffMessagesWithPeer,
  sendStaffMessage,
} from "@/server/services/admin-chat";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();
  if (user.role !== ROLES.ADMIN) return apiUnauthorized();

  const peerId = new URL(request.url).searchParams.get("peerId")?.trim();
  const organizationId = new URL(request.url).searchParams.get("organizationId")?.trim();
  if (!peerId || !organizationId) {
    return apiValidation("peerId and organizationId are required");
  }

  const messages = await listStaffMessagesWithPeer(user, peerId, organizationId);
  if (messages === null) return apiValidation("Cannot access this conversation");

  return Response.json({ messages });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();
  if (user.role !== ROLES.ADMIN) return apiUnauthorized();

  const body = await request.json().catch(() => ({}));
  const peerId = typeof body.peerId === "string" ? body.peerId.trim() : "";
  const organizationId = typeof body.organizationId === "string" ? body.organizationId.trim() : "";
  const text = typeof body.body === "string" ? body.body : "";
  if (!peerId || !organizationId) {
    return apiValidation("peerId and organizationId are required");
  }

  const result = await sendStaffMessage(user, { peerId, organizationId, body: text });
  if ("error" in result) return apiValidation(result.error ?? "Could not send message");

  return Response.json({ message: result.message }, { status: 201 });
}
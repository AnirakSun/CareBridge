import { apiNotFound, apiUnauthorized, apiValidation } from "@/lib/api-error";
import { ROLES } from "@/lib/constants";
import { messageSchema } from "@/lib/validation";
import { firstZodError } from "@/lib/zod-error";
import { getCurrentUser } from "@/server/session";
import {
  listPatientProviderMessages,
  sendPatientProviderMessage,
} from "@/server/services/patient-provider-messages";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();
  if (user.role !== ROLES.ADMIN) return apiUnauthorized();

  const patientId = new URL(request.url).searchParams.get("patientId")?.trim();
  const careProviderId = new URL(request.url).searchParams.get("careProviderId")?.trim();
  if (!patientId || !careProviderId) {
    return apiValidation("patientId and careProviderId are required");
  }

  const messages = await listPatientProviderMessages(user, careProviderId, patientId);
  if (messages === null) return apiNotFound();

  return Response.json({
    messages: messages.map((m) => ({
      id: m.id,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      sender: m.sender,
      displayName: m.displayName,
    })),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();
  if (user.role !== ROLES.ADMIN) return apiUnauthorized();

  const json = await request.json().catch(() => ({}));
  const patientId = typeof json.patientId === "string" ? json.patientId.trim() : "";
  const careProviderId = typeof json.careProviderId === "string" ? json.careProviderId.trim() : "";
  if (!patientId || !careProviderId) {
    return apiValidation("patientId and careProviderId are required");
  }

  const parsed = messageSchema.safeParse(json);
  if (!parsed.success) {
    return apiValidation(firstZodError(parsed.error));
  }

  const result = await sendPatientProviderMessage(
    user,
    careProviderId,
    parsed.data.body,
    patientId,
  );
  if ("error" in result) return apiValidation(result.error ?? "Could not send message");

  return Response.json(
    {
      message: {
        ...result.message,
        createdAt: result.message.createdAt.toISOString(),
      },
    },
    { status: 201 },
  );
}
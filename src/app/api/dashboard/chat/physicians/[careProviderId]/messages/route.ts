import { apiNotFound, apiUnauthorized, apiValidation } from "@/lib/api-error";
import { ROLES } from "@/lib/constants";
import { messageSchema } from "@/lib/validation";
import { firstZodError } from "@/lib/zod-error";
import { getCurrentUser } from "@/server/session";
import {
  listPatientProviderMessages,
  sendPatientProviderMessage,
} from "@/server/services/patient-provider-messages";

type Params = { params: Promise<{ careProviderId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();
  if (user.role !== ROLES.SUBMITTER) return apiUnauthorized();

  const { careProviderId } = await params;
  const messages = await listPatientProviderMessages(user, careProviderId);
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

export async function POST(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();
  if (user.role !== ROLES.SUBMITTER) return apiUnauthorized();

  const { careProviderId } = await params;
  const json = await request.json().catch(() => null);
  const parsed = messageSchema.safeParse(json);
  if (!parsed.success) {
    return apiValidation(firstZodError(parsed.error));
  }

  const result = await sendPatientProviderMessage(user, careProviderId, parsed.data.body);
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
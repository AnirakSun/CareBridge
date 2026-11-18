import { apiUnauthorized, apiValidation } from "@/lib/api-error";
import { adminChatLookupSchema } from "@/lib/validation";
import { firstZodError } from "@/lib/zod-error";
import { ROLES } from "@/lib/constants";
import { getCurrentUser } from "@/server/session";
import { resolveChatParticipant } from "@/server/services/admin-chat";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();
  if (user.role !== ROLES.ADMIN) return apiUnauthorized();

  const json = await request.json().catch(() => null);
  const parsed = adminChatLookupSchema.safeParse(json);
  if (!parsed.success) {
    return apiValidation(firstZodError(parsed.error));
  }

  const result = await resolveChatParticipant(user, parsed.data);
  if ("error" in result) return apiValidation(result.error ?? "Request failed");

  return Response.json({ contact: result });
}
import { apiNotFound, apiUnauthorized, apiValidation } from "@/lib/api-error";
import { firstZodError } from "@/lib/zod-error";
import { messageSchema } from "@/lib/validation";
import { getCurrentUser } from "@/server/session";
import { createMessage, listMessages } from "@/server/services/messages";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const messages = await listMessages(user, id);
  if (!messages) return apiNotFound();
  return Response.json({ messages });
}

export async function POST(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = messageSchema.safeParse(json);
  if (!parsed.success) {
    return apiValidation(firstZodError(parsed.error));
  }

  const message = await createMessage(user, id, parsed.data.body, parsed.data.kind);
  if (!message) return apiNotFound();
  return Response.json({ message }, { status: 201 });
}

import { apiForbidden, apiNotFound, apiUnauthorized, apiValidation } from "@/lib/api-error";
import { firstZodError } from "@/lib/zod-error";
import { statusUpdateSchema } from "@/lib/validation";
import { getCurrentUser } from "@/server/session";
import { ROLES } from "@/lib/constants";
import { updateSubmissionStatus } from "@/server/services/submissions";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();
  if (user.role !== ROLES.ADMIN) return apiForbidden();

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = statusUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return apiValidation(firstZodError(parsed.error));
  }

  try {
    const updated = await updateSubmissionStatus(
      user,
      id,
      parsed.data.status,
      parsed.data.note,
    );
    if (!updated) return apiNotFound();
    return Response.json({ submission: updated });
  } catch (err) {
    return apiValidation(err instanceof Error ? err.message : "Status update failed");
  }
}

import { apiNotFound, apiUnauthorized } from "@/lib/api-error";
import { getCurrentUser } from "@/server/session";
import { deleteInsurance, getProfile, setPrimaryInsurance } from "@/server/services/profile";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { id } = await context.params;
  const result = await deleteInsurance(user.id, id);
  if (!result) return apiNotFound("Insurance not found");

  const profile = await getProfile(user.id);
  return Response.json({ profile });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  if (body.setPrimary === true) {
    const result = await setPrimaryInsurance(user.id, id);
    if (!result) return apiNotFound("Insurance not found");
    const profile = await getProfile(user.id);
    return Response.json({ profile });
  }

  return apiNotFound("Unsupported update");
}
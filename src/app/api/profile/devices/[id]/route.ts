import { apiNotFound, apiUnauthorized } from "@/lib/api-error";
import { getCurrentUser } from "@/server/session";
import { disconnectDevice, getProfile } from "@/server/services/profile";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const result = await disconnectDevice(user, id);
  if (!result) return apiNotFound();

  const profile = await getProfile(user.id);
  return Response.json({ profile });
}
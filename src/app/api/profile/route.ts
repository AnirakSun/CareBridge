import { apiUnauthorized, apiValidation } from "@/lib/api-error";
import { firstZodError } from "@/lib/zod-error";
import { profileUpdateSchema } from "@/lib/validation";
import { getCurrentUser } from "@/server/session";
import { getProfile, updateProfile } from "@/server/services/profile";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const profile = await getProfile(user.id);
  return Response.json({ profile });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const json = await request.json().catch(() => null);
  const parsed = profileUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return apiValidation(firstZodError(parsed.error));
  }

  const profile = await updateProfile(user.id, parsed.data);
  return Response.json({ profile });
}
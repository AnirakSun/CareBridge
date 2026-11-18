import { apiUnauthorized, apiValidation } from "@/lib/api-error";
import { insuranceCreateSchema } from "@/lib/validation";
import { firstZodError } from "@/lib/zod-error";
import { getCurrentUser } from "@/server/session";
import { createInsurance, getProfile } from "@/server/services/profile";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const json = await request.json().catch(() => null);
  const parsed = insuranceCreateSchema.safeParse(json);
  if (!parsed.success) {
    return apiValidation(firstZodError(parsed.error));
  }

  await createInsurance(user.id, parsed.data);
  const profile = await getProfile(user.id);
  return Response.json({ profile }, { status: 201 });
}
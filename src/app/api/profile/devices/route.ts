import { apiUnauthorized, apiValidation } from "@/lib/api-error";
import { connectDeviceSchema } from "@/lib/validation";
import { firstZodError } from "@/lib/zod-error";
import type { HealthDeviceType } from "@/lib/constants";
import { getCurrentUser } from "@/server/session";
import { connectDevice, getProfile } from "@/server/services/profile";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const json = await request.json().catch(() => null);
  const parsed = connectDeviceSchema.safeParse(json);
  if (!parsed.success) {
    return apiValidation(firstZodError(parsed.error));
  }

  await connectDevice(user.id, parsed.data.deviceType as HealthDeviceType);
  const profile = await getProfile(user.id);
  return Response.json({ profile }, { status: 201 });
}
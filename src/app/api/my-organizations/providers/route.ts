import { apiNotFound, apiUnauthorized, apiValidation } from "@/lib/api-error";
import { getCurrentUser } from "@/server/session";
import {
  addPhysicianLink,
  getMyOrganizationsView,
  getProvidersForOrganization,
  removePhysicianLink,
} from "@/server/services/my-organizations";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const organizationId = new URL(request.url).searchParams.get("organizationId")?.trim();
  if (!organizationId) return apiValidation("organizationId query param is required");

  const providers = await getProvidersForOrganization(user, organizationId);
  if (providers === null) return apiNotFound("Organization not linked to your account");

  return Response.json({ providers });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const body = await request.json().catch(() => ({}));
  const careProviderId =
    typeof body.careProviderId === "string" ? body.careProviderId.trim() : "";
  if (!careProviderId) return apiValidation("careProviderId is required");

  const result = await addPhysicianLink(user.id, careProviderId);
  if ("error" in result) return apiValidation(result.error ?? "Request failed");

  const data = await getMyOrganizationsView(user.id);
  return Response.json(data);
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const careProviderId = new URL(request.url).searchParams.get("careProviderId")?.trim();
  if (!careProviderId) return apiValidation("careProviderId query param is required");

  await removePhysicianLink(user.id, careProviderId);
  const data = await getMyOrganizationsView(user.id);
  return Response.json(data);
}
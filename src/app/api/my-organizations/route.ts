import { apiUnauthorized, apiValidation } from "@/lib/api-error";
import { getCurrentUser } from "@/server/session";
import {
  addOrganizationLink,
  getMyOrganizationsView,
  removeOrganizationLink,
} from "@/server/services/my-organizations";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const data = await getMyOrganizationsView(user.id);
  return Response.json(data);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const body = await request.json().catch(() => ({}));
  const organizationId =
    typeof body.organizationId === "string" ? body.organizationId.trim() : "";
  if (!organizationId) return apiValidation("organizationId is required");

  const result = await addOrganizationLink(user.id, organizationId);
  if ("error" in result) return apiValidation(result.error ?? "Request failed");

  const data = await getMyOrganizationsView(user.id);
  return Response.json(data);
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const organizationId = new URL(request.url).searchParams.get("organizationId")?.trim();
  if (!organizationId) return apiValidation("organizationId query param is required");

  await removeOrganizationLink(user.id, organizationId);
  const data = await getMyOrganizationsView(user.id);
  return Response.json(data);
}
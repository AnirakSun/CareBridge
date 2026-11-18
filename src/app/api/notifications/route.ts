import { apiUnauthorized } from "@/lib/api-error";
import { getCurrentUser } from "@/server/session";
import {
  listNotifications,
  markNotificationsRead,
} from "@/server/services/notifications";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const notifications = await listNotifications(user);
  return Response.json({ notifications });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const body = await request.json().catch(() => ({}));
  const ids = Array.isArray(body.ids) ? (body.ids as string[]) : undefined;
  await markNotificationsRead(user, ids);
  return Response.json({ ok: true });
}

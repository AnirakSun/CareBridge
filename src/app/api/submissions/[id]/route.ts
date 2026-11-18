import { apiNotFound, apiUnauthorized } from "@/lib/api-error";
import { getCurrentUser } from "@/server/session";
import { getSubmissionForUser } from "@/server/services/submissions";
import { markSubmissionRead } from "@/server/services/messages";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const submission = await getSubmissionForUser(user, id);
  if (!submission) return apiNotFound();

  await markSubmissionRead(user, id);
  return Response.json({ submission });
}

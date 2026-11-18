import { NextRequest } from "next/server";
import { apiNotFound, apiUnauthorized, apiValidation } from "@/lib/api-error";
import { MAX_FILES_PER_SUBMISSION, ROLES } from "@/lib/constants";
import { getCurrentUser } from "@/server/session";
import { addDocumentsToSubmission, getSubmissionForUser } from "@/server/services/submissions";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();
  if (user.role !== ROLES.SUBMITTER) {
    return apiValidation("Only submitters can upload additional documents");
  }

  const { id } = await params;
  const form = await request.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return apiValidation("At least one file is required");
  if (files.length > MAX_FILES_PER_SUBMISSION) {
    return apiValidation(`Maximum ${MAX_FILES_PER_SUBMISSION} files allowed`);
  }

  try {
    const ok = await addDocumentsToSubmission(user, id, files);
    if (!ok) return apiNotFound();
    const submission = await getSubmissionForUser(user, id);
    return Response.json({ submission });
  } catch (err) {
    return apiValidation(err instanceof Error ? err.message : "Upload failed");
  }
}

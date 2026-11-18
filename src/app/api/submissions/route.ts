import { NextRequest } from "next/server";
import { apiUnauthorized, apiValidation } from "@/lib/api-error";
import { MAX_FILES_PER_SUBMISSION } from "@/lib/constants";
import { firstZodError } from "@/lib/zod-error";
import { submissionMetadataSchema } from "@/lib/validation";
import { getCurrentUser } from "@/server/session";
import { ROLES } from "@/lib/constants";
import {
  createSubmissionWithFiles,
  listAdminSubmissions,
  listSubmitterSubmissions,
} from "@/server/services/submissions";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { searchParams } = request.nextUrl;
  if (user.role === ROLES.ADMIN) {
    const submissions = await listAdminSubmissions(user, {
      q: searchParams.get("q") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    });
    return Response.json({ submissions });
  }

  const submissions = await listSubmitterSubmissions(user);
  return Response.json({ submissions });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();
  if (user.role !== ROLES.SUBMITTER) {
    return apiValidation("Only submitters can create submissions");
  }

  const form = await request.formData();
  const parsed = submissionMetadataSchema.safeParse({
    title: form.get("title"),
    category: form.get("category"),
    description: form.get("description"),
    recipientName: form.get("recipientName"),
    organizationId: form.get("organizationId"),
  });

  if (!parsed.success) {
    return apiValidation(firstZodError(parsed.error));
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return apiValidation("At least one document is required");
  }
  if (files.length > MAX_FILES_PER_SUBMISSION) {
    return apiValidation(`Maximum ${MAX_FILES_PER_SUBMISSION} files allowed`);
  }

  try {
    const submission = await createSubmissionWithFiles(user, parsed.data, files);
    return Response.json({ submission }, { status: 201 });
  } catch (err) {
    return apiValidation(err instanceof Error ? err.message : "Upload failed");
  }
}

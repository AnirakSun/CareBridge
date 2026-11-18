import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import { apiNotFound, apiUnauthorized } from "@/lib/api-error";
import { prisma } from "@/server/db";
import { canDownloadDocument } from "@/server/authz";
import { getCurrentUser } from "@/server/session";
import { resolveStoragePath } from "@/server/storage";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const document = await prisma.document.findUnique({
    where: { id },
    include: { submission: true },
  });

  if (!document || !canDownloadDocument(user, document.submission)) {
    return apiNotFound();
  }

  const filePath = resolveStoragePath(document.storageKey);
  try {
    await stat(filePath);
  } catch {
    return apiNotFound("File not found");
  }

  const url = new URL(request.url);
  const inline = url.searchParams.get("inline") === "1";
  const canInline =
    document.mimeType.startsWith("image/") || document.mimeType === "application/pdf";

  const stream = createReadStream(filePath);
  const webStream = Readable.toWeb(stream) as ReadableStream;

  return new Response(webStream, {
    headers: {
      "Content-Type": document.mimeType,
      "Content-Disposition": `${inline && canInline ? "inline" : "attachment"}; filename="${encodeURIComponent(document.originalName)}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}

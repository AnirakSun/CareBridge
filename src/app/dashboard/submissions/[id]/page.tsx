import Link from "next/link";
import { notFound } from "next/navigation";
import { AdditionalUploadForm } from "@/components/submissions/additional-upload";
import { MessageThread } from "@/components/messages/message-thread";
import { StatusTimeline } from "@/components/submissions/status-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SUBMISSION_STATUSES } from "@/lib/constants";
import { formatDateTime, formatFileSize, statusBadgeClass } from "@/lib/format";
import { getCurrentUser } from "@/server/session";
import { getSubmissionForUser } from "@/server/services/submissions";
import { markSubmissionRead } from "@/server/services/messages";

export default async function SubmitterSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { id } = await params;
  const submission = await getSubmissionForUser(user, id);
  if (!submission) notFound();

  await markSubmissionRead(user, id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">← Back to dashboard</Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm text-slate-500">{submission.referenceId}</p>
          <h1 className="text-3xl font-bold">{submission.title}</h1>
          <p className="mt-1 text-slate-600">
            {submission.organization.name} · Recipient: {submission.recipientName}
          </p>
        </div>
        <Badge className={statusBadgeClass(submission.status)}>{submission.status}</Badge>
      </div>

      {submission.status === SUBMISSION_STATUSES.ADDITIONAL_INFO && (
        <div className="mb-6">
          <AdditionalUploadForm submissionId={submission.id} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Category:</span> {submission.category}
            </p>
            <p>
              <span className="font-medium">Submitted:</span> {formatDateTime(submission.createdAt)}
            </p>
            <p>
              <span className="font-medium">Description:</span> {submission.description}
            </p>
            {submission.deviceContext && (
              <p>
                <span className="font-medium">Wearables:</span> {submission.deviceContext}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusTimeline entries={submission.statusHistory} />
          </CardContent>
        </Card>

        <Card id="submission-documents" className="lg:col-span-2 scroll-mt-24">
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {submission.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{doc.originalName}</p>
                  <p className="text-xs text-slate-500">
                    {doc.mimeType} · {formatFileSize(doc.sizeBytes)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <a href={`/api/documents/${doc.id}/download`}>Download</a>
                  </Button>
                  {(doc.mimeType.startsWith("image/") || doc.mimeType === "application/pdf") && (
                    <Button asChild variant="secondary" size="sm">
                      <a href={`/api/documents/${doc.id}/download?inline=1`} target="_blank" rel="noreferrer">
                        Preview
                      </a>
                    </Button>
                  )}
                </div>
                {(doc.mimeType.startsWith("image/") || doc.mimeType === "application/pdf") && (
                  <div className="sm:w-full">
                    {doc.mimeType.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/api/documents/${doc.id}/download?inline=1`}
                        alt={doc.originalName}
                        className="mt-2 max-h-64 rounded border"
                      />
                    ) : (
                      <iframe
                        title={doc.originalName}
                        src={`/api/documents/${doc.id}/download?inline=1`}
                        className="mt-2 h-64 w-full rounded border"
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card id="submission-messages" className="lg:col-span-2 scroll-mt-24">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <MessageThread
              submissionId={submission.id}
              currentUserId={user.id}
              isAdmin={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

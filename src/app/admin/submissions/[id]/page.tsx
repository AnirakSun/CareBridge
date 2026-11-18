import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminStatusPanel } from "@/components/submissions/admin-status-panel";
import { MessageThread } from "@/components/messages/message-thread";
import { StatusTimeline } from "@/components/submissions/status-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, formatFileSize, statusBadgeClass } from "@/lib/format";
import { getCurrentUser } from "@/server/session";
import { getSubmissionForUser } from "@/server/services/submissions";
import { markSubmissionRead } from "@/server/services/messages";

export default async function AdminSubmissionPage({
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
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/admin">← Back to queue</Link>
      </Button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm text-slate-500">{submission.referenceId}</p>
          <h1 className="text-3xl font-bold">{submission.title}</h1>
          <p className="mt-1 text-slate-600">
            Submitter: {submission.submitter.name} ({submission.submitter.email})
          </p>
        </div>
        <Badge className={statusBadgeClass(submission.status)}>{submission.status}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Review actions</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminStatusPanel submissionId={submission.id} currentStatus={submission.status} />
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

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Submission details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <p>
              <span className="font-medium">Organization:</span> {submission.organization.name}
            </p>
            <p>
              <span className="font-medium">Recipient:</span> {submission.recipientName}
            </p>
            <p>
              <span className="font-medium">Category:</span> {submission.category}
            </p>
            <p>
              <span className="font-medium">Submitted:</span> {formatDateTime(submission.createdAt)}
            </p>
            <p className="sm:col-span-2">
              <span className="font-medium">Description:</span> {submission.description}
            </p>
            {submission.deviceContext && (
              <p className="sm:col-span-2">
                <span className="font-medium">Wearables at upload:</span> {submission.deviceContext}
              </p>
            )}
          </CardContent>
        </Card>

        <Card id="submission-documents" className="lg:col-span-2 scroll-mt-24">
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {submission.documents.map((doc) => (
              <div key={doc.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
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
                        <a
                          href={`/api/documents/${doc.id}/download?inline=1`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Preview
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                {(doc.mimeType.startsWith("image/") || doc.mimeType === "application/pdf") && (
                  <>
                    {doc.mimeType.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/api/documents/${doc.id}/download?inline=1`}
                        alt={doc.originalName}
                        className="mt-3 max-h-80 rounded border"
                      />
                    ) : (
                      <iframe
                        title={doc.originalName}
                        src={`/api/documents/${doc.id}/download?inline=1`}
                        className="mt-3 h-80 w-full rounded border"
                      />
                    )}
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card id="submission-messages" className="lg:col-span-2 scroll-mt-24">
          <CardHeader>
            <CardTitle>Conversation with submitter</CardTitle>
          </CardHeader>
          <CardContent>
            <MessageThread
              submissionId={submission.id}
              currentUserId={user.id}
              isAdmin
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

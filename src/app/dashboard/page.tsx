import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SUBMISSION_STATUSES } from "@/lib/constants";
import { formatDateTime, statusBadgeClass } from "@/lib/format";
import { getCurrentUser } from "@/server/session";
import {
  countUnreadMessages,
  listSubmitterSubmissions,
} from "@/server/services/submissions";

export default async function SubmitterDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const submissions = await listSubmitterSubmissions(user);

  const stats = {
    total: submissions.length,
    submitted: submissions.filter((s) => s.status === SUBMISSION_STATUSES.SUBMITTED).length,
    inReview: submissions.filter((s) => s.status === SUBMISSION_STATUSES.UNDER_REVIEW).length,
    needsInfo: submissions.filter((s) => s.status === SUBMISSION_STATUSES.ADDITIONAL_INFO).length,
    completed: submissions.filter((s) => s.status === SUBMISSION_STATUSES.COMPLETED).length,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Submitter dashboard</h1>
          <p className="mt-1 text-slate-600">Track your document submissions and messages.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/submissions/new">
            <Plus className="h-4 w-4" /> New submission
          </Link>
        </Button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Total", stats.total],
          ["Submitted", stats.submitted],
          ["Under review", stats.inReview],
          ["Needs info", stats.needsInfo],
          ["Completed", stats.completed],
        ].map(([label, value]) => (
          <Card key={label as string}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submission history</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {submissions.length === 0 ? (
            <p className="text-sm text-slate-600">
              No submissions yet.{" "}
              <Link href="/dashboard/submissions/new" className="text-blue-700 underline">
                Create your first submission
              </Link>
              .
            </p>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-4">Reference</th>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Organization</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Updated</th>
                  <th className="py-2">Messages</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => {
                  const unread = countUnreadMessages(
                    { messages: s.messages, reads: s.reads },
                    user.id,
                  );
                  return (
                    <tr key={s.id} className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-mono text-xs">{s.referenceId}</td>
                      <td className="py-3 pr-4">
                        <Link
                          href={`/dashboard/submissions/${s.id}`}
                          className="font-medium text-blue-700 hover:underline"
                        >
                          {s.title}
                        </Link>
                      </td>
                      <td className="py-3 pr-4">{s.organization.name}</td>
                      <td className="py-3 pr-4">
                        <Badge className={statusBadgeClass(s.status)}>{s.status}</Badge>
                      </td>
                      <td className="py-3 pr-4">{formatDateTime(s.updatedAt)}</td>
                      <td className="py-3">
                        {unread > 0 ? (
                          <Badge className="bg-blue-700 text-white">{unread} unread</Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

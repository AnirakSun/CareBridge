import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_LIST, SUBMISSION_STATUSES } from "@/lib/constants";
import { formatDateTime, statusBadgeClass } from "@/lib/format";
import { getCurrentUser } from "@/server/session";
import {
  countUnreadMessages,
  listAdminSubmissions,
} from "@/server/services/submissions";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const params = await searchParams;
  const submissions = await listAdminSubmissions(user, params);

  const stats = {
    queue: submissions.length,
    submitted: submissions.filter((s) => s.status === SUBMISSION_STATUSES.SUBMITTED).length,
    review: submissions.filter((s) => s.status === SUBMISSION_STATUSES.UNDER_REVIEW).length,
    info: submissions.filter((s) => s.status === SUBMISSION_STATUSES.ADDITIONAL_INFO).length,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Administrator dashboard</h1>
        <p className="mt-1 text-slate-600">
          Review submissions for your assigned organizations:{" "}
          {user.memberships.map((m) => m.organization.name).join(", ") || "None assigned"}
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-slate-900">Patients</p>
            <p className="text-sm text-slate-600">
              View everyone in your queues and open submissions by status.
            </p>
          </div>
          <Link
            href="/admin/patients"
            className="inline-flex h-10 items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800"
          >
            View all patients
          </Link>
        </CardContent>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {[
          ["In queue", stats.queue],
          ["Submitted", stats.submitted],
          ["Under review", stats.review],
          ["Needs info", stats.info],
        ].map(([label, value]) => (
          <Card key={label as string}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <form className="flex flex-col gap-3 sm:flex-row" method="get">
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search title or reference ID…"
              className="h-10 flex-1 rounded-md border border-slate-200 px-3 text-sm"
            />
            <select
              name="status"
              defaultValue={params.status ?? ""}
              className="h-10 rounded-md border border-slate-200 px-3 text-sm"
            >
              <option value="">All statuses</option>
              {STATUS_LIST.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="h-10 rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800"
            >
              Filter
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submission queue</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {submissions.length === 0 ? (
            <p className="text-sm text-slate-600">No submissions match your filters.</p>
          ) : (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-4">Reference</th>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Submitter</th>
                  <th className="py-2 pr-4">Organization</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Updated</th>
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
                          href={`/admin/submissions/${s.id}`}
                          className="font-medium text-blue-700 hover:underline"
                        >
                          {s.title}
                          {unread > 0 && (
                            <Badge className="ml-2 bg-blue-700 text-white">{unread}</Badge>
                          )}
                        </Link>
                      </td>
                      <td className="py-3 pr-4">{s.submitter.name}</td>
                      <td className="py-3 pr-4">{s.organization.name}</td>
                      <td className="py-3 pr-4">
                        <Badge className={statusBadgeClass(s.status)}>{s.status}</Badge>
                      </td>
                      <td className="py-3">{formatDateTime(s.updatedAt)}</td>
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

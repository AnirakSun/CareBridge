import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewSubmissionForm } from "@/components/submissions/new-submission-form";
import { listActiveOrganizations } from "@/server/services/organizations";

export default async function NewSubmissionPage({
  searchParams,
}: {
  searchParams: Promise<{ organizationId?: string }>;
}) {
  const { organizationId } = await searchParams;
  const organizations = await listActiveOrganizations();
  const defaultOrganizationId =
    organizationId && organizations.some((o) => o.id === organizationId)
      ? organizationId
      : undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>New document submission</CardTitle>
          <p className="text-sm text-slate-600">
            Upload synthetic healthcare documents and send them to a participating organization.
          </p>
        </CardHeader>
        <CardContent>
          <NewSubmissionForm
            organizations={organizations}
            defaultOrganizationId={defaultOrganizationId}
          />
        </CardContent>
      </Card>
    </div>
  );
}

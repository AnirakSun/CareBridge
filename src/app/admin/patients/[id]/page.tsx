import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientSubmissionList } from "@/components/admin/patient-submission-list";
import { getCurrentUser } from "@/server/session";
import { getAdminPatientDetail } from "@/server/services/admin-patients";

export default async function AdminPatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { id } = await params;
  const detail = await getAdminPatientDetail(user, id);
  if (!detail) notFound();

  const { patient, inQueue, submitted, underReview, needsInfo } = detail;

  const sections = [
    {
      title: "In queue",
      description: "Active submissions not yet completed.",
      items: inQueue,
      empty: "No active submissions in queue.",
    },
    {
      title: "Submitted",
      description: "Newly submitted, awaiting initial review.",
      items: submitted,
      empty: "No submissions in Submitted status.",
    },
    {
      title: "Under review",
      description: "Currently being reviewed by your team.",
      items: underReview,
      empty: "No submissions under review.",
    },
    {
      title: "Needs info",
      description: "Additional information requested from the patient.",
      items: needsInfo,
      empty: "No submissions waiting on patient info.",
    },
  ] as const;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/admin/patients">
          <ArrowLeft className="h-4 w-4" /> All patients
        </Link>
      </Button>
      <h1 className="text-3xl font-bold text-slate-900">{patient.name}</h1>
      <p className="mt-1 text-slate-600">{patient.email}</p>
      {(patient.phone || patient.city) && (
        <p className="text-sm text-slate-500">
          {[patient.phone, patient.city && patient.state ? `${patient.city}, ${patient.state}` : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}

      <div className="mt-8 space-y-6">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
              <p className="text-sm text-slate-600">{section.description}</p>
            </CardHeader>
            <CardContent>
              <PatientSubmissionList items={section.items} emptyLabel={section.empty} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientChatClient } from "@/components/patient/patient-chat-client";
import { getCurrentUser } from "@/server/session";
import { listPatientChatOverview } from "@/server/services/patient-chat";

export default async function PatientChatPage({
  searchParams,
}: {
  searchParams: Promise<{ physician?: string; submission?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const params = await searchParams;
  const overview = await listPatientChatOverview(user);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
      </Button>
      <h1 className="text-3xl font-bold text-slate-900">Chat</h1>
      <p className="mt-2 text-slate-600">
        Message your linked physicians directly or continue conversations on your submissions.
      </p>
      <div className="mt-8">
        <PatientChatClient
          currentUserId={user.id}
          initialCareProviderId={params.physician?.trim() || null}
          initialSubmissionId={params.submission?.trim() || null}
          physicians={overview.physicians}
          physicianThreads={overview.physicianThreads.map((t) => ({
            ...t,
            lastMessageAt: t.lastMessageAt?.toISOString() ?? null,
          }))}
          submissionThreads={overview.submissionThreads.map((t) => ({
            ...t,
            lastMessageAt: t.lastMessageAt?.toISOString() ?? null,
          }))}
        />
      </div>
    </div>
  );
}
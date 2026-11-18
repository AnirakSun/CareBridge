import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminChatClient } from "@/components/admin/admin-chat-client";
import { getCurrentUser } from "@/server/session";
import { listAdminChatOverview, listCreatableChatContacts } from "@/server/services/admin-chat";
import {
  listAdminCareTeamThreads,
  listCreatableCareTeamContacts,
} from "@/server/services/patient-provider-messages";

export default async function AdminChatPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string; physician?: string; submission?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const params = await searchParams;
  const [{ patientThreads, physicianThreads }, creatable, careTeamThreads, creatableCareTeam] =
    await Promise.all([
      listAdminChatOverview(user),
      listCreatableChatContacts(user),
      listAdminCareTeamThreads(user),
      listCreatableCareTeamContacts(user),
    ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/admin">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
      </Button>
      <h1 className="text-3xl font-bold text-slate-900">Chat</h1>
      <p className="mt-2 text-slate-600">
        Message patients on submissions, respond to direct care-team chats, and coordinate with
        colleagues.
      </p>
      <div className="mt-8">
        <AdminChatClient
          currentUserId={user.id}
          initialPatientId={params.patient?.trim() || null}
          initialCareProviderId={params.physician?.trim() || null}
          initialSubmissionId={params.submission?.trim() || null}
          patientThreads={patientThreads.map((t) => ({
            ...t,
            lastMessageAt: t.lastMessageAt?.toISOString() ?? null,
          }))}
          physicianThreads={physicianThreads.map((t) => ({
            ...t,
            lastMessageAt: t.lastMessageAt?.toISOString() ?? null,
          }))}
          creatablePatients={creatable.patients}
          creatablePhysicians={creatable.physicians}
          careTeamThreads={careTeamThreads.map((t) => ({
            ...t,
            lastMessageAt: t.lastMessageAt?.toISOString() ?? null,
          }))}
          creatableCareTeam={creatableCareTeam}
        />
      </div>
    </div>
  );
}
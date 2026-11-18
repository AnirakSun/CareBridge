import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/server/session";
import { listAdminPatients } from "@/server/services/admin-patients";

export default async function AdminPatientsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const patients = await listAdminPatients(user);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/admin">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
      </Button>
      <h1 className="text-3xl font-bold text-slate-900">Patients</h1>
      <p className="mt-2 text-slate-600">
        Patients with submissions to your assigned organizations. Select a patient to review their
        documents by status.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Your patients</CardTitle>
          <CardDescription>Synthetic demo accounts only.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {patients.length === 0 ? (
            <p className="text-sm text-slate-600">No patients in your organization queues yet.</p>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-4">Patient</th>
                  <th className="py-2 pr-4">In queue</th>
                  <th className="py-2 pr-4">Submitted</th>
                  <th className="py-2 pr-4">Under review</th>
                  <th className="py-2 pr-4">Needs info</th>
                  <th className="py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/admin/patients/${p.id}`}
                        className="font-medium text-blue-700 hover:underline"
                      >
                        {p.name}
                      </Link>
                      <p className="text-xs text-slate-500">{p.email}</p>
                    </td>
                    <td className="py-3 pr-4">{p.inQueue}</td>
                    <td className="py-3 pr-4">{p.submitted}</td>
                    <td className="py-3 pr-4">{p.underReview}</td>
                    <td className="py-3 pr-4">{p.needsInfo}</td>
                    <td className="py-3">{p.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
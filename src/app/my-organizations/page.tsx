import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MyOrganizationsClient } from "@/components/my-organizations/my-organizations-client";
import { ROLES } from "@/lib/constants";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/session";
import { getMyOrganizationsView } from "@/server/services/my-organizations";

export const dynamic = "force-dynamic";

export default async function MyOrganizationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/my-organizations");

  const data = await getMyOrganizationsView(user.id);
  const backHref = user.role === ROLES.ADMIN ? "/admin" : "/dashboard";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </Button>
      <h1 className="mb-2 text-3xl font-bold text-slate-900">My organizations</h1>
      <p className="mb-8 text-slate-600">
        See who you are connected with in CareBridge and manage organizations and physicians on your
        care team.
      </p>
      <MyOrganizationsClient initial={data} />
    </div>
  );
}
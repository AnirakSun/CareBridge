import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileSettings } from "@/components/profile/profile-settings";
import { ROLES } from "@/lib/constants";
import { getCurrentUser } from "@/server/session";
import { getProfile } from "@/server/services/profile";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await getProfile(user.id);
  if (!profile) return null;

  const backHref = user.role === ROLES.ADMIN ? "/admin" : "/dashboard";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </Button>
      <h1 className="mb-2 text-3xl font-bold text-slate-900">Profile & devices</h1>
      <p className="mb-8 text-slate-600">
        Edit your account, address, insurance, and connected devices (synthetic demo data only).
      </p>
      <ProfileSettings
        initialProfile={{
          ...profile,
          connectedDevices: profile.connectedDevices.map((d) => ({
            ...d,
            connectedAt: d.connectedAt.toISOString(),
            lastSyncAt: d.lastSyncAt?.toISOString() ?? null,
          })),
        }}
      />
    </div>
  );
}
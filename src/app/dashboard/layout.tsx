import { redirect } from "next/navigation";
import { ROLES } from "@/lib/constants";
import { getCurrentUser } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  if (user.role === ROLES.ADMIN) redirect("/admin");
  return <>{children}</>;
}

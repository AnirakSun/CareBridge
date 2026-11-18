import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");
  return <>{children}</>;
}
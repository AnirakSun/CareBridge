import Link from "next/link";
import { LogOut, Shield } from "lucide-react";
import { CareBridgeLogo } from "@/components/brand/care-bridge-logo";
import { logoutAction } from "@/server/auth";
import { getCurrentUser } from "@/server/session";
import { unreadNotificationCount } from "@/server/services/notifications";
import { Button } from "@/components/ui/button";
import { NotificationsBell } from "./notifications-bell";
import { PublicSiteNav } from "./public-site-nav";
import { UserAccountMenu } from "./user-account-menu";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const unread = user ? await unreadNotificationCount(user) : 0;

  return (
    <header className="relative border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center gap-3 justify-self-start">
            <Link href="/" className="flex items-center gap-2 font-semibold text-blue-800">
              <CareBridgeLogo className="text-blue-800" />
              <span>CareBridge</span>
            </Link>
          </div>

          <div className="hidden justify-self-center md:block">
            <PublicSiteNav user={user} />
          </div>

          <div className="flex items-center justify-end gap-2 justify-self-end">
          {user ? (
            <>
              <NotificationsBell initialUnreadCount={unread} userRole={user.role} />
              <UserAccountMenu name={user.name} role={user.role} />
              <form action={logoutAction}>
                <Button type="submit" variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
          {!user && (
            <span className="sr-only">
              <Shield aria-hidden />
            </span>
          )}
          </div>
        </div>

        <div className="border-t border-slate-100 py-3 md:hidden">
          <PublicSiteNav user={user} />
        </div>
      </div>
    </header>
  );
}

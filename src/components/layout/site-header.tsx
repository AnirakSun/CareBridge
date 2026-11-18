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
        <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 py-3 md:h-16 md:grid-cols-[1fr_auto_1fr] md:gap-y-0 md:py-0">
          <Link
            href="/"
            className="col-start-1 row-start-1 flex items-center gap-2 justify-self-start font-semibold text-blue-800"
          >
            <CareBridgeLogo className="text-blue-800" />
            <span>CareBridge</span>
          </Link>

          <PublicSiteNav className="col-span-2 row-start-2 justify-self-center border-t border-slate-100 pt-3 md:col-span-1 md:col-start-2 md:row-start-1 md:border-0 md:pt-0" />

          <div className="col-start-2 row-start-1 flex items-center justify-end gap-2 justify-self-end md:col-start-3">
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
      </div>
    </header>
  );
}
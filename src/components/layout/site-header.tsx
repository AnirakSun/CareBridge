import Link from "next/link";
import { LogOut, Shield } from "lucide-react";
import { CareBridgeLogo } from "@/components/brand/care-bridge-logo";
import { logoutAction } from "@/server/auth";
import { getCurrentUser } from "@/server/session";
import { unreadNotificationCount } from "@/server/services/notifications";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";
import { NotificationsBell } from "./notifications-bell";
import { UserAccountMenu } from "./user-account-menu";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const unread = user ? await unreadNotificationCount(user) : 0;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <MobileNav user={user} />
          <Link href="/" className="flex items-center gap-2 font-semibold text-blue-800">
            <CareBridgeLogo className="text-blue-800" />
            <span>CareBridge</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
          <Link href="/organizations" className="hover:text-blue-700">
            Organizations
          </Link>
        </nav>

        <div className="flex items-center gap-2">
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
    </header>
  );
}

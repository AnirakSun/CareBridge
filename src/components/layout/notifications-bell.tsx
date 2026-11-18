"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useCallback, useState } from "react";
import { ROLES } from "@/lib/constants";
import { notificationHref as resolveNotificationHref } from "@/lib/notification-routes";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NotificationRow = {
  id: string;
  submissionId: string | null;
  careProviderId: string | null;
  patientId: string | null;
  type: string;
  text: string;
  readAt: string | null;
  createdAt: string;
};

type Props = {
  initialUnreadCount: number;
  userRole: string;
};

export function NotificationsBell({ initialUnreadCount, userRole }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = (await res.json()) as { notifications: NotificationRow[] };
      setNotifications(data.notifications);
      setUnreadCount(data.notifications.filter((n) => !n.readAt).length);
    } finally {
      setLoading(false);
    }
  }, []);

  async function markRead(ids?: string[]) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ids?.length ? { ids } : {}),
    });
    if (ids?.length) {
      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, readAt: new Date().toISOString() } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - ids.length));
    } else {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
      );
      setUnreadCount(0);
    }
    router.refresh();
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) void loadNotifications();
  }

  function notificationHref(n: NotificationRow) {
    return resolveNotificationHref(
      {
        type: n.type,
        submissionId: n.submissionId,
        careProviderId: n.careProviderId,
        patientId: n.patientId,
      },
      userRole,
    );
  }

  function onNotificationClick(n: NotificationRow) {
    if (!n.readAt) void markRead([n.id]);
    setOpen(false);
  }

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative rounded-md p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell className="h-5 w-5" aria-hidden />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-700 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={() => void markRead()}
            >
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {loading && notifications.length === 0 && (
          <p className="px-3 py-4 text-sm text-slate-500">Loading…</p>
        )}
        {!loading && notifications.length === 0 && (
          <p className="px-3 py-4 text-sm text-slate-500">No notifications yet.</p>
        )}
        {notifications.map((n) => (
          <DropdownMenuItem
            key={n.id}
            asChild
            className={!n.readAt ? "bg-blue-50/80 p-0" : "p-0"}
          >
            <Link
              href={notificationHref(n)}
              className="flex w-full cursor-pointer flex-col gap-0.5 rounded-sm px-3 py-2 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100"
              onClick={() => onNotificationClick(n)}
            >
              <span className="font-medium text-slate-900">{n.text}</span>
              <span className="text-xs text-slate-500">{formatDateTime(n.createdAt)}</span>
            </Link>
          </DropdownMenuItem>
        ))}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="justify-center text-blue-700">
              <Link
                href={userRole === ROLES.ADMIN ? "/admin" : "/dashboard"}
                onClick={() => setOpen(false)}
              >
                View all submissions
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

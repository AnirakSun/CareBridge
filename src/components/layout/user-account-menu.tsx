"use client";

import Link from "next/link";
import { Building2, ChevronDown, FileUp, LayoutDashboard, MessageSquare, User } from "lucide-react";
import { ROLES } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  name: string;
  role: string;
};

export function UserAccountMenu({ name, role }: Props) {
  const uploadHref = "/dashboard/submissions/new";
  const homeHref = role === ROLES.ADMIN ? "/admin" : "/dashboard";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex max-w-[11rem] items-center gap-1 truncate rounded-md px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
        <span className="truncate" title={name}>
          {name}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate font-normal text-slate-500">{name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={homeHref} className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" aria-hidden />
            {role === ROLES.ADMIN ? "Admin" : "Dashboard"}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2">
            <User className="h-4 w-4" aria-hidden />
            Profile
          </Link>
        </DropdownMenuItem>
        {role === ROLES.SUBMITTER && (
          <DropdownMenuItem asChild>
            <Link href={uploadHref} className="flex items-center gap-2">
              <FileUp className="h-4 w-4" aria-hidden />
              Upload documents
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link
            href={role === ROLES.ADMIN ? "/admin/chat" : "/dashboard/chat"}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" aria-hidden />
            Chat
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/my-organizations" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" aria-hidden />
            My organizations
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
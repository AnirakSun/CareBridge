"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  user: { name: string; role: string } | null;
};

export function MobileNav({ user }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-expanded={open}
        aria-label="Open menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      {open && (
        <div className="absolute left-0 top-16 z-50 w-full border-b border-slate-200 bg-white p-4 shadow-md">
          <nav className="flex flex-col gap-3 text-sm font-medium">
            <Link href="/about" onClick={() => setOpen(false)}>
              About us
            </Link>
            <Link href="/organizations" onClick={() => setOpen(false)}>
              Organizations
            </Link>
            <Link href="/faqs" onClick={() => setOpen(false)}>
              FAQs
            </Link>
            {!user && (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}>
                  Register
                </Link>
              </>
            )}
            <div className="my-1 border-t border-slate-200 pt-3">
              <Link href="/contact" onClick={() => setOpen(false)}>
                Contact us
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}

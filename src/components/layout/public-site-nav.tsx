"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  layout?: "row" | "column";
  onNavigate?: () => void;
};

const linkClass =
  "text-slate-700 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm";

export function PublicSiteNav({ className, layout = "row", onNavigate }: Props) {
  const close = onNavigate;

  return (
    <nav
      className={cn(
        "text-sm font-medium",
        layout === "row"
          ? "flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          : "flex flex-col items-center gap-3 text-center",
        className,
      )}
      aria-label="Site"
    >
      <Link href="/about" className={linkClass} onClick={close}>
        About Us
      </Link>
      <Link href="/organizations" className={linkClass} onClick={close}>
        Organizations
      </Link>
      <Link href="/faqs" className={linkClass} onClick={close}>
        FAQs
      </Link>
      <Link href="/contact" className={linkClass} onClick={close}>
        Contact us
      </Link>
    </nav>
  );
}
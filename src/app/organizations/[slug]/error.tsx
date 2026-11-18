"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OrganizationDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const needsDb =
    error.message.includes("OrganizationFacility") ||
    error.message.includes("CareProvider") ||
    error.message.includes("no such column") ||
    error.message.includes("SQLITE");

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Could not load organization</h1>
      <p className="mt-2 text-slate-600">
        {needsDb
          ? "Your local database is out of date. Run npm run db:reset, then restart the dev server."
          : "Something went wrong loading this organization profile."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button type="button" variant="outline" onClick={reset}>
          Try again
        </Button>
        <Button asChild>
          <Link href="/organizations">Back to directory</Link>
        </Button>
      </div>
    </div>
  );
}

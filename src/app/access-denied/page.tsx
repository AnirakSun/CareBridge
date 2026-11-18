import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AccessDeniedPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Access denied</h1>
      <p className="mt-2 text-slate-600">
        You do not have permission to view this area. Administrators and submitters have separate
        dashboards.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

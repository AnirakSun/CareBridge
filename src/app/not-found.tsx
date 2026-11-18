import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-slate-600">The page you requested does not exist.</p>
      <Button asChild className="mt-6">
        <Link href="/">Return home</Link>
      </Button>
    </div>
  );
}

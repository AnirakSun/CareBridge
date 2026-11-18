"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-slate-600">Please try again. If the problem persists, restart the app.</p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}

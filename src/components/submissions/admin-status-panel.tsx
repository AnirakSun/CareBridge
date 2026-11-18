"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { SUBMISSION_STATUSES, STATUS_LIST } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AdminStatusPanel({
  submissionId,
  currentStatus,
}: {
  submissionId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const options = STATUS_LIST.filter((s) => s !== currentStatus);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: note || undefined }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Could not update status");
        return;
      }
      toast.success("Status updated");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (currentStatus === SUBMISSION_STATUSES.COMPLETED) {
    return <p className="text-sm text-slate-600">This submission is completed.</p>;
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="space-y-2">
        <Label htmlFor="status">Update status</Label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="flex h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
        >
          <option value={currentStatus}>{currentStatus} (current)</option>
          {options.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
      </div>
      <Button type="button" onClick={save} disabled={saving || status === currentStatus}>
        {saving ? "Saving…" : "Save status"}
      </Button>
    </div>
  );
}

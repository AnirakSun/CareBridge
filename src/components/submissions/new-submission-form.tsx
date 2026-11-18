"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { DOCUMENT_CATEGORIES, MAX_FILES_PER_SUBMISSION } from "@/lib/constants";
import { validateFileMeta } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Org = { id: string; name: string; city: string; state: string };

export function NewSubmissionForm({
  organizations,
  defaultOrganizationId,
}: {
  organizations: Org[];
  defaultOrganizationId?: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function onFilesSelected(list: FileList | null) {
    if (!list) return;
    const next = [...files, ...Array.from(list)].slice(0, MAX_FILES_PER_SUBMISSION);
    for (let i = 0; i < next.length; i++) {
      const err = validateFileMeta(next[i], i);
      if (err) {
        toast.error(err);
        return;
      }
    }
    setFiles(next);
  }

  async function submitForm(form: HTMLFormElement) {
    setSubmitting(true);
    const raw = new FormData(form);
    const data = new FormData();
    for (const [key, value] of raw.entries()) {
      if (key !== "files") data.append(key, value);
    }
    const selected =
      files.length > 0
        ? files
        : fileInputRef.current?.files
          ? Array.from(fileInputRef.current.files)
          : [];
    selected.forEach((f) => data.append("files", f));
    if (selected.length === 0) {
      toast.error("At least one document is required");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/submissions", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Submission failed");
        return;
      }
      toast.success("Submission sent successfully");
      router.push(`/dashboard/submissions/${json.submission.id}`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        void submitForm(e.currentTarget);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Document title</Label>
          <Input id="title" name="title" required minLength={3} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            required
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
          >
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="organizationId">Recipient organization</Label>
          <select
            id="organizationId"
            name="organizationId"
            required
            defaultValue={defaultOrganizationId ?? ""}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">Select organization…</option>
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} — {o.city}, {o.state}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="recipientName">Intended recipient (department or contact)</Label>
          <Input id="recipientName" name="recipientName" required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" required minLength={10} rows={4} />
        </div>
      </div>

      <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6">
        <Label htmlFor="files" className="mb-2 block">
          Upload documents (PDF, DOCX, JPG, PNG — max 10 MB each)
        </Label>
        <Input
          ref={fileInputRef}
          id="files"
          type="file"
          multiple
          accept=".pdf,.docx,.jpg,.jpeg,.png"
          onChange={(e) => onFilesSelected(e.target.files)}
        />
        {files.length > 0 && (
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
            {files.map((f) => (
              <li key={`${f.name}-${f.size}`}>{f.name}</li>
            ))}
          </ul>
        )}
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit for review"}
      </Button>
    </form>
  );
}

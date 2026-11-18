"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { validateFileMeta } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdditionalUploadForm({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  async function upload() {
    if (files.length === 0) return;
    setUploading(true);
    const data = new FormData();
    files.forEach((f) => data.append("files", f));
    try {
      const res = await fetch(`/api/submissions/${submissionId}/documents`, {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Upload failed");
        return;
      }
      toast.success("Additional documents uploaded");
      setFiles([]);
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
      <p className="mb-2 text-sm font-medium text-orange-900">
        Additional information requested — upload more documents
      </p>
      <Label htmlFor="additional-files" className="sr-only">
        Additional files
      </Label>
      <Input
        id="additional-files"
        type="file"
        multiple
        accept=".pdf,.docx,.jpg,.jpeg,.png"
        onChange={(e) => {
          const list = e.target.files ? Array.from(e.target.files) : [];
          for (let i = 0; i < list.length; i++) {
            const err = validateFileMeta(list[i], i);
            if (err) {
              toast.error(err);
              return;
            }
          }
          setFiles(list);
        }}
      />
      <Button type="button" className="mt-2" onClick={upload} disabled={uploading || !files.length}>
        {uploading ? "Uploading…" : "Upload additional files"}
      </Button>
    </div>
  );
}

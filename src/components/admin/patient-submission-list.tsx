import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, statusBadgeClass } from "@/lib/format";

type Row = {
  id: string;
  referenceId: string;
  title: string;
  status: string;
  updatedAt: Date;
  organization: { name: string };
};

export function PatientSubmissionList({
  items,
  emptyLabel,
}: {
  items: Row[];
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-600">{emptyLabel}</p>;
  }

  return (
    <ul className="divide-y divide-slate-100">
      {items.map((s) => (
        <li key={s.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href={`/admin/submissions/${s.id}`}
              className="font-medium text-blue-700 hover:underline"
            >
              {s.title}
            </Link>
            <p className="text-xs text-slate-500">
              {s.referenceId} · {s.organization.name} · Updated {formatDateTime(s.updatedAt)}
            </p>
          </div>
          <Badge className={statusBadgeClass(s.status)}>{s.status}</Badge>
        </li>
      ))}
    </ul>
  );
}
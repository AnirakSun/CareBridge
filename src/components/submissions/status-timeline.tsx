import { formatDateTime, statusBadgeClass } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

type Entry = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  createdAt: Date;
  changedBy: { name: string };
};

export function StatusTimeline({ entries }: { entries: Entry[] }) {
  return (
    <ol className="space-y-4 border-l-2 border-slate-200 pl-4">
      {entries.map((entry) => (
        <li key={entry.id} className="relative">
          <span className="absolute -left-[1.35rem] top-1 h-3 w-3 rounded-full bg-blue-700 ring-4 ring-white" />
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={statusBadgeClass(entry.toStatus)}>{entry.toStatus}</Badge>
            <span className="text-xs text-slate-500">{formatDateTime(entry.createdAt)}</span>
          </div>
          <p className="mt-1 text-sm text-slate-700">
            Updated by {entry.changedBy.name}
            {entry.note ? ` — ${entry.note}` : ""}
          </p>
        </li>
      ))}
    </ol>
  );
}

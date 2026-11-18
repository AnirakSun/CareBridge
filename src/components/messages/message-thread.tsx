"use client";

import useSWR from "swr";
import { useState } from "react";
import { toast } from "sonner";
import { MESSAGE_KINDS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Message = {
  id: string;
  body: string;
  kind: string;
  createdAt: string;
  sender: { id: string; name: string; role: string };
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Props = {
  submissionId: string;
  currentUserId: string;
  isAdmin: boolean;
  allowInfoRequest?: boolean;
};

export function MessageThread({
  submissionId,
  currentUserId,
  isAdmin,
  allowInfoRequest = true,
}: Props) {
  const { data, mutate, isLoading } = useSWR<{ messages: Message[] }>(
    `/api/submissions/${submissionId}/messages`,
    fetcher,
    { refreshInterval: 10000 },
  );

  const [body, setBody] = useState("");
  const [kind, setKind] = useState<string>(MESSAGE_KINDS.MESSAGE);
  const [sending, setSending] = useState(false);

  const messages = data?.messages ?? [];

  async function sendMessage() {
    if (!body.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, kind: isAdmin ? kind : MESSAGE_KINDS.MESSAGE }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Failed to send message");
        return;
      }
      setBody("");
      setKind(MESSAGE_KINDS.MESSAGE);
      await mutate();
      toast.success("Message sent");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="max-h-96 space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
        {isLoading && messages.length === 0 && (
          <p className="text-sm text-slate-500">Loading messages…</p>
        )}
        {messages.length === 0 && !isLoading && (
          <p className="text-sm text-slate-500">No messages yet. Start the conversation below.</p>
        )}
        {messages.map((m) => {
          const mine = m.sender.id === currentUserId;
          return (
            <div
              key={m.id}
              className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  mine ? "bg-blue-700 text-white" : "bg-white text-slate-800 shadow-sm"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.body}</p>
              </div>
              <span className="mt-1 text-xs text-slate-500">
                {m.sender.name} · {m.kind.replace("_", " ")} · {formatDateTime(m.createdAt)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        {isAdmin && allowInfoRequest && (
          <div className="flex flex-wrap gap-2 text-sm">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={kind === MESSAGE_KINDS.MESSAGE}
                onChange={() => setKind(MESSAGE_KINDS.MESSAGE)}
              />
              Message
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={kind === MESSAGE_KINDS.FEEDBACK}
                onChange={() => setKind(MESSAGE_KINDS.FEEDBACK)}
              />
              Feedback
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={kind === MESSAGE_KINDS.INFO_REQUEST}
                onChange={() => setKind(MESSAGE_KINDS.INFO_REQUEST)}
              />
              Info request
            </label>
          </div>
        )}
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a message…"
          rows={3}
        />
        <Button type="button" onClick={sendMessage} disabled={sending || !body.trim()}>
          {sending ? "Sending…" : "Send message"}
        </Button>
      </div>
    </div>
  );
}

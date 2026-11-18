"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageThread } from "@/components/messages/message-thread";
import { ProviderAvatar } from "@/components/organizations/provider-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/format";

type Physician = {
  careProviderId: string;
  name: string;
  title: string;
  specialty: string;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  organization: { id: string; name: string; slug: string };
};

type PhysicianThread = {
  careProviderId: string;
  physicianName: string;
  specialty: string;
  organizationName: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
};

type SubmissionThread = {
  submissionId: string;
  referenceId: string;
  title: string;
  status: string;
  organizationName: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
};

type ProviderMessage = {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; name: string; role: string };
  displayName: string;
};

type Selection =
  | { type: "physician"; careProviderId: string; label: string; physicianName: string }
  | { type: "submission"; submissionId: string; label: string; lastMessageAt?: string | null };

export function PatientChatClient({
  currentUserId,
  physicians,
  physicianThreads,
  submissionThreads,
  initialCareProviderId = null,
  initialSubmissionId = null,
}: {
  currentUserId: string;
  physicians: Physician[];
  physicianThreads: PhysicianThread[];
  submissionThreads: SubmissionThread[];
  initialCareProviderId?: string | null;
  initialSubmissionId?: string | null;
}) {
  const router = useRouter();
  const [selection, setSelection] = useState<Selection | null>(null);
  const [physicianQuery, setPhysicianQuery] = useState("");
  const [createPick, setCreatePick] = useState("");
  const [providerMessages, setProviderMessages] = useState<ProviderMessage[]>([]);
  const [providerLoading, setProviderLoading] = useState(false);
  const [providerBody, setProviderBody] = useState("");
  const [providerSending, setProviderSending] = useState(false);

  const physicianById = useMemo(() => {
    const map = new Map<string, Physician>();
    for (const p of physicians) map.set(p.careProviderId, p);
    return map;
  }, [physicians]);

  const filteredPhysicians = physicians.filter((p) => {
    const q = physicianQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.specialty.toLowerCase().includes(q) ||
      p.organization.name.toLowerCase().includes(q)
    );
  });

  const loadProviderChat = useCallback(async (careProviderId: string, silent = false) => {
    if (!silent) setProviderLoading(true);
    try {
      const res = await fetch(
        `/api/dashboard/chat/physicians/${encodeURIComponent(careProviderId)}/messages`,
      );
      const json = await res.json();
      if (!res.ok) {
        if (!silent) toast.error(json.error?.message ?? "Could not load messages");
        if (!silent) setProviderMessages([]);
        return;
      }
      setProviderMessages(json.messages as ProviderMessage[]);
    } finally {
      if (!silent) setProviderLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selection?.type !== "physician") return;
    const id = selection.careProviderId;
    const timer = window.setInterval(() => {
      void loadProviderChat(id, true);
    }, 10_000);
    return () => window.clearInterval(timer);
  }, [selection, loadProviderChat]);

  function openPhysicianChat(careProviderId: string) {
    const p = physicianById.get(careProviderId);
    const name = p?.name ?? physicianThreads.find((t) => t.careProviderId === careProviderId)?.physicianName ?? "Physician";
    const org = p?.organization.name ?? "";
    setSelection({
      type: "physician",
      careProviderId,
      label: org ? `${name} · ${org}` : name,
      physicianName: name,
    });
    void loadProviderChat(careProviderId);
  }

  function openSubmissionChat(submissionId: string, referenceId: string, title: string, lastMessageAt: string | null) {
    setSelection({
      type: "submission",
      submissionId,
      label: `${referenceId} · ${title}`,
      lastMessageAt,
    });
    setProviderMessages([]);
  }

  const appliedDeepLink = useRef(false);
  useEffect(() => {
    if (appliedDeepLink.current) return;
    if (initialCareProviderId) {
      appliedDeepLink.current = true;
      openPhysicianChat(initialCareProviderId);
      return;
    }
    if (initialSubmissionId) {
      appliedDeepLink.current = true;
      const t = submissionThreads.find((s) => s.submissionId === initialSubmissionId);
      if (t) {
        openSubmissionChat(t.submissionId, t.referenceId, t.title, t.lastMessageAt);
      } else {
        setSelection({
          type: "submission",
          submissionId: initialSubmissionId,
          label: "Submission messages",
        });
        setProviderMessages([]);
      }
    }
  }, [
    initialCareProviderId,
    initialSubmissionId,
    submissionThreads,
    physicianById,
    physicianThreads,
  ]);

  function startFromDropdown() {
    if (!createPick) return;
    openPhysicianChat(createPick);
    setCreatePick("");
    toast.success("Conversation opened");
  }

  async function sendProviderMessage() {
    if (selection?.type !== "physician" || !providerBody.trim()) return;
    setProviderSending(true);
    try {
      const res = await fetch(
        `/api/dashboard/chat/physicians/${encodeURIComponent(selection.careProviderId)}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: providerBody.trim() }),
        },
      );
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Could not send message");
        return;
      }
      setProviderBody("");
      await loadProviderChat(selection.careProviderId);
      router.refresh();
      toast.success("Message sent");
    } finally {
      setProviderSending(false);
    }
  }

  const activePhysician =
    selection?.type === "physician" ? physicianById.get(selection.careProviderId) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(240px,320px)_1fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your physicians</CardTitle>
            <CardDescription>Click a physician to message them directly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="physician-search">Search physicians</Label>
              <Input
                id="physician-search"
                value={physicianQuery}
                onChange={(e) => setPhysicianQuery(e.target.value)}
                placeholder="Name or specialty…"
              />
            </div>
            <ul className="max-h-56 space-y-2 overflow-y-auto text-sm">
              {filteredPhysicians.length === 0 ? (
                <li className="text-slate-600">No physicians match. Add them under My organizations.</li>
              ) : (
                filteredPhysicians.map((p) => {
                  const selected =
                    selection?.type === "physician" && selection.careProviderId === p.careProviderId;
                  return (
                    <li key={p.careProviderId}>
                      <button
                        type="button"
                        className={`flex w-full gap-3 rounded-lg border p-3 text-left hover:bg-slate-50 ${
                          selected ? "border-blue-300 bg-blue-50" : "border-slate-200"
                        }`}
                        onClick={() => openPhysicianChat(p.careProviderId)}
                      >
                        <ProviderAvatar name={p.name} photoUrl={p.photoUrl} size={48} />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900">
                            {p.name}, {p.title}
                          </p>
                          <p className="text-xs text-slate-600">
                            {p.specialty} · {p.organization.name}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Select a conversation</CardTitle>
            <CardDescription>Physician and submission message threads.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[24rem] space-y-4 overflow-y-auto">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Physicians
              </p>
              {physicianThreads.length === 0 ? (
                <p className="text-sm text-slate-600">No physician chats yet.</p>
              ) : (
                <ul className="space-y-2">
                  {physicianThreads.map((t) => (
                    <li key={t.careProviderId}>
                      <button
                        type="button"
                        className={`w-full rounded-lg border p-3 text-left text-sm hover:bg-slate-50 ${
                          selection?.type === "physician" && selection.careProviderId === t.careProviderId
                            ? "border-blue-300 bg-blue-50"
                            : "border-slate-200"
                        }`}
                        onClick={() => openPhysicianChat(t.careProviderId)}
                      >
                        <span className="font-medium text-slate-900">{t.physicianName}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {t.specialty} · {t.organizationName}
                        </span>
                        {t.lastMessagePreview && (
                          <span className="mt-1 line-clamp-2 text-xs text-slate-600">
                            {t.lastMessagePreview}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Submissions
              </p>
              {submissionThreads.length === 0 ? (
                <p className="text-sm text-slate-600">No submission chats yet.</p>
              ) : (
                <ul className="space-y-2">
                  {submissionThreads.map((t) => (
                    <li key={t.submissionId}>
                      <button
                        type="button"
                        className={`w-full rounded-lg border p-3 text-left text-sm hover:bg-slate-50 ${
                          selection?.type === "submission" && selection.submissionId === t.submissionId
                            ? "border-blue-300 bg-blue-50"
                            : "border-slate-200"
                        }`}
                        onClick={() =>
                          openSubmissionChat(
                            t.submissionId,
                            t.referenceId,
                            t.title,
                            t.lastMessageAt,
                          )
                        }
                      >
                        <span className="font-medium text-slate-900">{t.title}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {t.referenceId} · {t.organizationName}
                        </span>
                        {t.lastMessagePreview && (
                          <span className="mt-1 line-clamp-2 text-xs text-slate-600">
                            {t.lastMessagePreview}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="min-h-[24rem]">
        <CardHeader>
          <CardTitle className="text-base">
            {selection ? selection.label : "Create a conversation"}
          </CardTitle>
          {!selection && (
            <CardDescription>
              Start a direct message with one of your linked physicians.
            </CardDescription>
          )}
          {selection?.type === "submission" && selection.lastMessageAt && (
            <p className="text-xs text-slate-500">
              Last activity {formatDateTime(selection.lastMessageAt)}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {!selection && (
            <div className="space-y-3">
              <Label htmlFor="create-physician-pick">Physician on your care team</Label>
              <select
                id="create-physician-pick"
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={createPick}
                onChange={(e) => setCreatePick(e.target.value)}
              >
                <option value="">Select a physician…</option>
                {physicians.map((p) => (
                  <option key={p.careProviderId} value={p.careProviderId}>
                    {p.name} · {p.specialty} ({p.organization.name})
                  </option>
                ))}
              </select>
              <Button type="button" disabled={!createPick || physicians.length === 0} onClick={startFromDropdown}>
                Start chat
              </Button>
              {physicians.length === 0 && (
                <p className="text-sm text-slate-600">
                  Link physicians under My organizations before starting a chat.
                </p>
              )}
            </div>
          )}

          {selection?.type === "physician" && (
            <div className="flex flex-col gap-4">
              {activePhysician && (
                <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <ProviderAvatar
                    name={activePhysician.name}
                    photoUrl={activePhysician.photoUrl}
                    size={56}
                  />
                  <div>
                    <p className="font-medium text-slate-900">
                      {activePhysician.name}, {activePhysician.title}
                    </p>
                    <p className="text-sm text-slate-600">
                      {activePhysician.specialty} · {activePhysician.organization.name}
                    </p>
                  </div>
                </div>
              )}
              <div className="max-h-96 space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
                {providerLoading && <p className="text-sm text-slate-500">Loading messages…</p>}
                {!providerLoading && providerMessages.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No messages yet. Say hello to {selection.physicianName}.
                  </p>
                )}
                {providerMessages.map((m) => {
                  const mine = m.sender.id === currentUserId;
                  return (
                    <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                      <span className="mb-1 text-xs text-slate-500">
                        {m.displayName} · {formatDateTime(m.createdAt)}
                      </span>
                      <span
                        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                          mine ? "bg-blue-700 text-white" : "border border-slate-200 bg-white"
                        }`}
                      >
                        {m.body}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-2">
                <Textarea
                  value={providerBody}
                  onChange={(e) => setProviderBody(e.target.value)}
                  placeholder={`Message ${selection.physicianName}…`}
                  rows={3}
                />
                <Button
                  type="button"
                  disabled={providerSending || !providerBody.trim()}
                  onClick={() => void sendProviderMessage()}
                >
                  {providerSending ? "Sending…" : "Send"}
                </Button>
              </div>
            </div>
          )}

          {selection?.type === "submission" && (
            <MessageThread
              submissionId={selection.submissionId}
              currentUserId={currentUserId}
              isAdmin={false}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
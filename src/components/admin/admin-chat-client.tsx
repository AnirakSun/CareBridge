"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { MessageThread } from "@/components/messages/message-thread";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, statusBadgeClass } from "@/lib/format";

type PatientThread = {
  kind: "patient";
  submissionId: string;
  patientId: string;
  patientName: string;
  referenceId: string;
  title: string;
  status: string;
  organizationName: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
};

type PhysicianThread = {
  kind: "physician";
  peerId: string;
  peerName: string;
  organizationId: string;
  organizationName: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
};

type CreatablePatient = {
  patientId: string;
  patientName: string;
  email: string;
  submissionId: string;
  referenceId: string;
  organizationName: string;
};

type CreatablePhysician = {
  peerId: string;
  peerName: string;
  email: string;
  organizationId: string;
  organizationName: string;
};

type CareTeamThread = {
  patientId: string;
  patientName: string;
  careProviderId: string;
  physicianName: string;
  specialty: string;
  organizationName: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
};

type CreatableCareTeam = {
  patientId: string;
  patientName: string;
  careProviderId: string;
  physicianName: string;
  organizationName: string;
};

type StaffMessage = {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; name: string };
};

type CareTeamMessage = {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; name: string };
  displayName: string;
};

type Selection =
  | { type: "patient"; submissionId: string; label: string; status?: string; title?: string }
  | { type: "physician"; peerId: string; organizationId: string; label: string }
  | {
      type: "careTeam";
      patientId: string;
      careProviderId: string;
      label: string;
      physicianName: string;
    };

export function AdminChatClient({
  currentUserId,
  patientThreads,
  physicianThreads,
  creatablePatients,
  creatablePhysicians,
  careTeamThreads,
  creatableCareTeam,
  initialPatientId = null,
  initialCareProviderId = null,
  initialSubmissionId = null,
}: {
  currentUserId: string;
  patientThreads: PatientThread[];
  physicianThreads: PhysicianThread[];
  creatablePatients: CreatablePatient[];
  creatablePhysicians: CreatablePhysician[];
  careTeamThreads: CareTeamThread[];
  creatableCareTeam: CreatableCareTeam[];
  initialPatientId?: string | null;
  initialCareProviderId?: string | null;
  initialSubmissionId?: string | null;
}) {
  const [filter, setFilter] = useState<"all" | "patient" | "physician" | "careTeam">("all");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [createPick, setCreatePick] = useState("");
  const [staffMessages, setStaffMessages] = useState<StaffMessage[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffBody, setStaffBody] = useState("");
  const [staffSending, setStaffSending] = useState(false);
  const [careTeamMessages, setCareTeamMessages] = useState<CareTeamMessage[]>([]);
  const [careTeamLoading, setCareTeamLoading] = useState(false);
  const [careTeamBody, setCareTeamBody] = useState("");
  const [careTeamSending, setCareTeamSending] = useState(false);
  const [lookupName, setLookupName] = useState("");
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupBusy, setLookupBusy] = useState(false);

  const patientMeta = useMemo(() => {
    const map = new Map<string, PatientThread>();
    for (const t of patientThreads) map.set(t.submissionId, t);
    for (const p of creatablePatients) {
      if (!map.has(p.submissionId)) {
        map.set(p.submissionId, {
          kind: "patient",
          submissionId: p.submissionId,
          patientId: p.patientId,
          patientName: p.patientName,
          referenceId: p.referenceId,
          title: p.referenceId,
          status: "",
          organizationName: p.organizationName,
          lastMessageAt: null,
          lastMessagePreview: null,
        });
      }
    }
    return map;
  }, [patientThreads, creatablePatients]);

  const loadStaffChat = useCallback(async (peerId: string, organizationId: string) => {
    setStaffLoading(true);
    try {
      const res = await fetch(
        `/api/admin/chat/staff?peerId=${encodeURIComponent(peerId)}&organizationId=${encodeURIComponent(organizationId)}`,
      );
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Could not load messages");
        setStaffMessages([]);
        return;
      }
      setStaffMessages(json.messages as StaffMessage[]);
    } finally {
      setStaffLoading(false);
    }
  }, []);

  const loadCareTeamChat = useCallback(async (patientId: string, careProviderId: string, silent = false) => {
    if (!silent) setCareTeamLoading(true);
    try {
      const res = await fetch(
        `/api/admin/chat/care-team?patientId=${encodeURIComponent(patientId)}&careProviderId=${encodeURIComponent(careProviderId)}`,
      );
      const json = await res.json();
      if (!res.ok) {
        if (!silent) toast.error(json.error?.message ?? "Could not load messages");
        if (!silent) setCareTeamMessages([]);
        return;
      }
      setCareTeamMessages(json.messages as CareTeamMessage[]);
    } finally {
      if (!silent) setCareTeamLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selection?.type !== "careTeam") return;
    const { patientId, careProviderId } = selection;
    const timer = window.setInterval(() => {
      void loadCareTeamChat(patientId, careProviderId, true);
    }, 10_000);
    return () => window.clearInterval(timer);
  }, [selection, loadCareTeamChat]);

  function openPatientChat(submissionId: string, patientName: string, referenceId: string) {
    const meta = patientMeta.get(submissionId);
    setSelection({
      type: "patient",
      submissionId,
      label: `${patientName} · ${referenceId}`,
      status: meta?.status,
      title: meta?.title,
    });
    setStaffMessages([]);
    setCareTeamMessages([]);
  }

  function openPhysicianChat(peerId: string, organizationId: string, peerName: string, orgName: string) {
    setSelection({
      type: "physician",
      peerId,
      organizationId,
      label: `${peerName} · ${orgName}`,
    });
    setCareTeamMessages([]);
    void loadStaffChat(peerId, organizationId);
  }

  function openCareTeamChat(
    patientId: string,
    careProviderId: string,
    patientName: string,
    physicianName: string,
    organizationName: string,
  ) {
    setFilter("careTeam");
    setSelection({
      type: "careTeam",
      patientId,
      careProviderId,
      label: `${patientName} → ${physicianName}`,
      physicianName,
    });
    setStaffMessages([]);
    void loadCareTeamChat(patientId, careProviderId);
  }

  const appliedDeepLink = useRef(false);
  useEffect(() => {
    if (appliedDeepLink.current) return;
    if (initialPatientId && initialCareProviderId) {
      appliedDeepLink.current = true;
      const t = careTeamThreads.find(
        (row) =>
          row.patientId === initialPatientId && row.careProviderId === initialCareProviderId,
      );
      const c = creatableCareTeam.find(
        (row) =>
          row.patientId === initialPatientId && row.careProviderId === initialCareProviderId,
      );
      openCareTeamChat(
        initialPatientId,
        initialCareProviderId,
        t?.patientName ?? c?.patientName ?? "Patient",
        t?.physicianName ?? c?.physicianName ?? "Physician",
        t?.organizationName ?? c?.organizationName ?? "",
      );
      return;
    }
    if (initialSubmissionId) {
      appliedDeepLink.current = true;
      const meta = patientMeta.get(initialSubmissionId);
      if (meta) {
        setFilter("patient");
        openPatientChat(initialSubmissionId, meta.patientName, meta.referenceId);
      } else {
        setFilter("patient");
        setSelection({
          type: "patient",
          submissionId: initialSubmissionId,
          label: "Submission messages",
        });
        setStaffMessages([]);
      }
    }
  }, [
    initialPatientId,
    initialCareProviderId,
    initialSubmissionId,
    careTeamThreads,
    creatableCareTeam,
    patientMeta,
  ]);

  function startFromDropdown() {
    if (!createPick) return;
    if (createPick.startsWith("patient:")) {
      const submissionId = createPick.slice("patient:".length);
      const p = creatablePatients.find((x) => x.submissionId === submissionId);
      if (p) openPatientChat(p.submissionId, p.patientName, p.referenceId);
      return;
    }
    if (createPick.startsWith("physician:")) {
      const [, peerId, organizationId] = createPick.split(":");
      const ph = creatablePhysicians.find(
        (x) => x.peerId === peerId && x.organizationId === organizationId,
      );
      if (ph) openPhysicianChat(ph.peerId, ph.organizationId, ph.peerName, ph.organizationName);
      return;
    }
    if (createPick.startsWith("careTeam:")) {
      const [, patientId, careProviderId] = createPick.split(":");
      const ct = creatableCareTeam.find(
        (x) => x.patientId === patientId && x.careProviderId === careProviderId,
      );
      if (ct) {
        openCareTeamChat(
          ct.patientId,
          ct.careProviderId,
          ct.patientName,
          ct.physicianName,
          ct.organizationName,
        );
      }
    }
  }

  async function lookupAndStart() {
    setLookupBusy(true);
    try {
      const res = await fetch("/api/admin/chat/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lookupName,
          email: lookupEmail || undefined,
          phone: lookupPhone || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Could not find person");
        return;
      }
      const c = json.contact as
        | {
            kind: "patient";
            patientName: string;
            submissionId: string;
            referenceId: string;
          }
        | {
            kind: "physician";
            peerName: string;
            peerId: string;
            organizationId: string;
            organizationName: string;
          };
      if (c.kind === "patient") {
        openPatientChat(c.submissionId, c.patientName, c.referenceId);
      } else {
        openPhysicianChat(c.peerId, c.organizationId, c.peerName, c.organizationName);
      }
      toast.success("Conversation opened");
    } finally {
      setLookupBusy(false);
    }
  }

  async function sendCareTeamMessage() {
    if (selection?.type !== "careTeam" || !careTeamBody.trim()) return;
    setCareTeamSending(true);
    try {
      const res = await fetch("/api/admin/chat/care-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selection.patientId,
          careProviderId: selection.careProviderId,
          body: careTeamBody.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Could not send message");
        return;
      }
      setCareTeamBody("");
      await loadCareTeamChat(selection.patientId, selection.careProviderId);
      toast.success("Message sent");
    } finally {
      setCareTeamSending(false);
    }
  }

  async function sendStaffMessage() {
    if (selection?.type !== "physician" || !staffBody.trim()) return;
    setStaffSending(true);
    try {
      const res = await fetch("/api/admin/chat/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          peerId: selection.peerId,
          organizationId: selection.organizationId,
          body: staffBody.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Could not send message");
        return;
      }
      setStaffBody("");
      await loadStaffChat(selection.peerId, selection.organizationId);
      toast.success("Message sent");
    } finally {
      setStaffSending(false);
    }
  }

  const showPatients = filter === "all" || filter === "patient";
  const showPhysicians = filter === "all" || filter === "physician";
  const showCareTeam = filter === "all" || filter === "careTeam";

  const activePatient = selection?.type === "patient" ? patientMeta.get(selection.submissionId) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(240px,320px)_1fr]">
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select a conversation</CardTitle>
          <CardDescription>Existing patient and physician message threads.</CardDescription>
          <div className="flex flex-wrap gap-2 pt-2">
            {(["all", "patient", "careTeam", "physician"] as const).map((f) => (
              <Button
                key={f}
                type="button"
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
              >
                {f === "all"
                  ? "All"
                  : f === "patient"
                    ? "Submissions"
                    : f === "careTeam"
                      ? "Care team"
                      : "Colleagues"}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="max-h-[32rem] space-y-4 overflow-y-auto">
          {showPatients && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Patients (on submissions)
              </p>
              {patientThreads.length === 0 ? (
                <p className="text-sm text-slate-600">No patient chats yet.</p>
              ) : (
                <ul className="space-y-2">
                  {patientThreads.map((t) => (
                    <li key={t.submissionId}>
                      <button
                        type="button"
                        className={`w-full rounded-lg border p-3 text-left text-sm hover:bg-slate-50 ${
                          selection?.type === "patient" && selection.submissionId === t.submissionId
                            ? "border-blue-300 bg-blue-50"
                            : "border-slate-200"
                        }`}
                        onClick={() => openPatientChat(t.submissionId, t.patientName, t.referenceId)}
                      >
                        <span className="font-medium text-slate-900">{t.patientName}</span>
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
          )}
          {showCareTeam && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Care team (direct)
              </p>
              {careTeamThreads.length === 0 ? (
                <p className="text-sm text-slate-600">No direct patient messages yet.</p>
              ) : (
                <ul className="space-y-2">
                  {careTeamThreads.map((t) => (
                    <li key={`${t.patientId}:${t.careProviderId}`}>
                      <button
                        type="button"
                        className={`w-full rounded-lg border p-3 text-left text-sm hover:bg-slate-50 ${
                          selection?.type === "careTeam" &&
                          selection.patientId === t.patientId &&
                          selection.careProviderId === t.careProviderId
                            ? "border-blue-300 bg-blue-50"
                            : "border-slate-200"
                        }`}
                        onClick={() =>
                          openCareTeamChat(
                            t.patientId,
                            t.careProviderId,
                            t.patientName,
                            t.physicianName,
                            t.organizationName,
                          )
                        }
                      >
                        <span className="font-medium text-slate-900">{t.patientName}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {t.physicianName} · {t.organizationName}
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
          )}
          {showPhysicians && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Physicians & colleagues
              </p>
              {physicianThreads.length === 0 ? (
                <p className="text-sm text-slate-600">No colleague chats yet.</p>
              ) : (
                <ul className="space-y-2">
                  {physicianThreads.map((t) => (
                    <li key={`${t.organizationId}:${t.peerId}`}>
                      <button
                        type="button"
                        className={`w-full rounded-lg border p-3 text-left text-sm hover:bg-slate-50 ${
                          selection?.type === "physician" &&
                          selection.peerId === t.peerId &&
                          selection.organizationId === t.organizationId
                            ? "border-blue-300 bg-blue-50"
                            : "border-slate-200"
                        }`}
                        onClick={() =>
                          openPhysicianChat(t.peerId, t.organizationId, t.peerName, t.organizationName)
                        }
                      >
                        <span className="font-medium text-slate-900">{t.peerName}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">{t.organizationName}</span>
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
          )}
        </CardContent>
      </Card>

      <Card className="min-h-[24rem]">
        <CardHeader>
          <CardTitle className="text-base">
            {selection ? selection.label : "Create a conversation"}
          </CardTitle>
          {!selection && (
            <CardDescription>
              Choose a patient or physician below, or add someone by name and contact info.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {!selection && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="create-chat-pick">Start with someone in your network</Label>
                <select
                  id="create-chat-pick"
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                  value={createPick}
                  onChange={(e) => setCreatePick(e.target.value)}
                >
                  <option value="">Select a patient or physician…</option>
                  {creatablePatients.length > 0 && (
                    <optgroup label="Patients">
                      {creatablePatients.map((p) => (
                        <option key={p.submissionId} value={`patient:${p.submissionId}`}>
                          {p.patientName} · {p.referenceId} ({p.organizationName})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {creatableCareTeam.length > 0 && (
                    <optgroup label="Care team (patient → physician)">
                      {creatableCareTeam.map((c) => (
                        <option
                          key={`${c.patientId}:${c.careProviderId}`}
                          value={`careTeam:${c.patientId}:${c.careProviderId}`}
                        >
                          {c.patientName} → {c.physicianName} ({c.organizationName})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {creatablePhysicians.length > 0 && (
                    <optgroup label="Colleagues">
                      {creatablePhysicians.map((p) => (
                        <option
                          key={`${p.organizationId}:${p.peerId}`}
                          value={`physician:${p.peerId}:${p.organizationId}`}
                        >
                          {p.peerName} · {p.organizationName}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                <Button type="button" disabled={!createPick} onClick={startFromDropdown}>
                  Start chat
                </Button>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="mb-1 text-sm font-semibold text-slate-900">Add a person to chat with</h3>
                <p className="mb-3 text-xs text-slate-600">
                  Enter their name and either email or phone to find them in CareBridge (demo).
                </p>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="lookup-name">Full name</Label>
                    <Input
                      id="lookup-name"
                      value={lookupName}
                      onChange={(e) => setLookupName(e.target.value)}
                      placeholder="Alex Submitter"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="lookup-email">Email</Label>
                      <Input
                        id="lookup-email"
                        type="email"
                        value={lookupEmail}
                        onChange={(e) => setLookupEmail(e.target.value)}
                        placeholder="name@carebridge.demo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lookup-phone">Phone</Label>
                      <Input
                        id="lookup-phone"
                        type="tel"
                        value={lookupPhone}
                        onChange={(e) => setLookupPhone(e.target.value)}
                        placeholder="(555) 100-2000"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    disabled={lookupBusy || !lookupName.trim() || (!lookupEmail && !lookupPhone)}
                    onClick={() => void lookupAndStart()}
                  >
                    {lookupBusy ? "Looking up…" : "Start chat"}
                  </Button>
                </div>
              </div>
            </div>
          )}
          {selection?.type === "patient" && (
            <div className="space-y-4">
              {activePatient?.status && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge className={statusBadgeClass(activePatient.status)}>{activePatient.status}</Badge>
                  {activePatient.title && (
                    <span className="text-slate-600">{activePatient.title}</span>
                  )}
                  <Link
                    href={`/admin/submissions/${selection.submissionId}`}
                    className="text-blue-700 hover:underline"
                  >
                    Open submission
                  </Link>
                </div>
              )}
              <MessageThread
                submissionId={selection.submissionId}
                currentUserId={currentUserId}
                isAdmin
              />
            </div>
          )}
          {selection?.type === "careTeam" && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-slate-600">
                Replying as <span className="font-medium">{selection.physicianName}</span> — the
                patient sees the physician name on their side.
              </p>
              <div className="max-h-96 space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
                {careTeamLoading && <p className="text-sm text-slate-500">Loading messages…</p>}
                {!careTeamLoading && careTeamMessages.length === 0 && (
                  <p className="text-sm text-slate-500">No messages yet.</p>
                )}
                {careTeamMessages.map((m) => {
                  const mine = m.sender.id === currentUserId;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
                    >
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
                  value={careTeamBody}
                  onChange={(e) => setCareTeamBody(e.target.value)}
                  placeholder={`Reply as ${selection.physicianName}…`}
                  rows={3}
                />
                <Button
                  type="button"
                  disabled={careTeamSending || !careTeamBody.trim()}
                  onClick={() => void sendCareTeamMessage()}
                >
                  {careTeamSending ? "Sending…" : "Send"}
                </Button>
              </div>
            </div>
          )}
          {selection?.type === "physician" && (
            <div className="flex flex-col gap-4">
              <div className="max-h-96 space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
                {staffLoading && <p className="text-sm text-slate-500">Loading messages…</p>}
                {!staffLoading && staffMessages.length === 0 && (
                  <p className="text-sm text-slate-500">No messages yet. Say hello to your colleague.</p>
                )}
                {staffMessages.map((m) => {
                  const mine = m.sender.id === currentUserId;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
                    >
                      <span className="mb-1 text-xs text-slate-500">
                        {m.sender.name} · {formatDateTime(m.createdAt)}
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
                  value={staffBody}
                  onChange={(e) => setStaffBody(e.target.value)}
                  placeholder="Message your colleague…"
                  rows={3}
                />
                <Button
                  type="button"
                  disabled={staffSending || !staffBody.trim()}
                  onClick={() => void sendStaffMessage()}
                >
                  {staffSending ? "Sending…" : "Send"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
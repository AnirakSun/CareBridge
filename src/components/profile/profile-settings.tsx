"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  HEALTH_DEVICES,
  HEALTH_DEVICE_CONNECTION_GUIDE_URLS,
  HEALTH_DEVICE_LABELS,
  type HealthDeviceType,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type DeviceRow = {
  id: string;
  deviceType: string;
  displayName: string;
  status: string;
  connectedAt: string;
  lastSyncAt: string | null;
};

type InsuranceRow = {
  id: string;
  providerName: string;
  planName: string | null;
  memberId: string | null;
  groupNumber: string | null;
  isPrimary: boolean;
};

type Profile = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  streetAddress: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  role: string;
  connectedDevices: DeviceRow[];
  insurances: InsuranceRow[];
};

const DEVICE_OPTIONS = Object.values(HEALTH_DEVICES);

export function ProfileSettings({ initialProfile }: { initialProfile: Profile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [name, setName] = useState(initialProfile.name);
  const [phone, setPhone] = useState(initialProfile.phone ?? "");
  const [streetAddress, setStreetAddress] = useState(initialProfile.streetAddress ?? "");
  const [addressLine2, setAddressLine2] = useState(initialProfile.addressLine2 ?? "");
  const [city, setCity] = useState(initialProfile.city ?? "");
  const [state, setState] = useState(initialProfile.state ?? "");
  const [zipCode, setZipCode] = useState(initialProfile.zipCode ?? "");
  const [insProvider, setInsProvider] = useState("");
  const [insPlan, setInsPlan] = useState("");
  const [insMemberId, setInsMemberId] = useState("");
  const [insGroup, setInsGroup] = useState("");
  const [insPrimary, setInsPrimary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [insuranceBusy, setInsuranceBusy] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [pendingDevice, setPendingDevice] = useState<HealthDeviceType | null>(null);

  const connected = profile.connectedDevices.filter((d) => d.status === "CONNECTED");

  function applyServerProfile(next: Profile) {
    setProfile(next);
    setName(next.name);
    setPhone(next.phone ?? "");
    setStreetAddress(next.streetAddress ?? "");
    setAddressLine2(next.addressLine2 ?? "");
    setCity(next.city ?? "");
    setState(next.state ?? "");
    setZipCode(next.zipCode ?? "");
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone || undefined,
          streetAddress: streetAddress || undefined,
          addressLine2: addressLine2 || undefined,
          city: city || undefined,
          state: state || undefined,
          zipCode: zipCode || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Could not save profile");
        return;
      }
      applyServerProfile(json.profile as Profile);
      toast.success("Profile updated");
    } finally {
      setSaving(false);
    }
  }

  function startDeviceConnect(deviceType: HealthDeviceType) {
    setPendingDevice(deviceType);
  }

  function openDeviceGuide(deviceType: HealthDeviceType) {
    const url = HEALTH_DEVICE_CONNECTION_GUIDE_URLS[deviceType];
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function connectDevice(deviceType: HealthDeviceType) {
    setPendingDevice(null);
    setConnecting(deviceType);
    try {
      const res = await fetch("/api/profile/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceType }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Could not connect device");
        return;
      }
      applyServerProfile(json.profile as Profile);
      toast.success(`${HEALTH_DEVICE_LABELS[deviceType]} connected (demo)`);
    } finally {
      setConnecting(null);
    }
  }

  async function disconnectDevice(deviceId: string) {
    const res = await fetch(`/api/profile/devices/${deviceId}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error?.message ?? "Could not disconnect");
      return;
    }
    applyServerProfile(json.profile as Profile);
    toast.success("Device disconnected");
  }

  async function addInsurance() {
    if (!insProvider.trim()) {
      toast.error("Enter an insurance provider name");
      return;
    }
    setInsuranceBusy(true);
    try {
      const res = await fetch("/api/profile/insurances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerName: insProvider.trim(),
          planName: insPlan || undefined,
          memberId: insMemberId || undefined,
          groupNumber: insGroup || undefined,
          isPrimary: insPrimary,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Could not add insurance");
        return;
      }
      applyServerProfile(json.profile as Profile);
      setInsProvider("");
      setInsPlan("");
      setInsMemberId("");
      setInsGroup("");
      setInsPrimary(false);
      toast.success("Insurance added");
    } finally {
      setInsuranceBusy(false);
    }
  }

  async function removeInsurance(id: string) {
    setInsuranceBusy(true);
    try {
      const res = await fetch(`/api/profile/insurances/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Could not remove insurance");
        return;
      }
      applyServerProfile(json.profile as Profile);
      toast.success("Insurance removed");
    } finally {
      setInsuranceBusy(false);
    }
  }

  async function makePrimaryInsurance(id: string) {
    setInsuranceBusy(true);
    try {
      const res = await fetch(`/api/profile/insurances/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setPrimary: true }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Could not update insurance");
        return;
      }
      applyServerProfile(json.profile as Profile);
      toast.success("Primary insurance updated");
    } finally {
      setInsuranceBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your name and contact details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile.email} disabled className="bg-slate-50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 000-0000"
            />
          </div>
          <Button type="button" onClick={() => void saveProfile()} disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Home address</CardTitle>
          <CardDescription>
            Mailing address for correspondence and demo intake forms. Use synthetic data only in this
            prototype.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="streetAddress">Street address</Label>
            <Input
              id="streetAddress"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              autoComplete="street-address"
              placeholder="123 Demo Lane"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressLine2">Apartment, suite, etc. (optional)</Label>
            <Input
              id="addressLine2"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              autoComplete="address-line2"
              placeholder="Apt 4B"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                autoComplete="address-level2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                autoComplete="address-level1"
                maxLength={2}
                placeholder="CA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP code</Label>
              <Input
                id="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                autoComplete="postal-code"
                placeholder="90210"
              />
            </div>
          </div>
          <Button type="button" onClick={() => void saveProfile()} disabled={saving}>
            {saving ? "Saving…" : "Save address"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Insurance</CardTitle>
          <CardDescription>
            Manage your health plans for submissions and care coordination. Add primary and
            secondary coverage as needed (synthetic demo values only).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {profile.insurances.length > 0 ? (
            <ul className="space-y-3">
              {profile.insurances.map((ins) => (
                <li
                  key={ins.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">{ins.providerName}</p>
                    {ins.planName && <p className="text-sm text-slate-600">{ins.planName}</p>}
                    <p className="text-xs text-slate-500">
                      {ins.memberId ? `Member ID: ${ins.memberId}` : "No member ID on file"}
                      {ins.groupNumber ? ` · Group: ${ins.groupNumber}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {ins.isPrimary ? (
                      <Badge className="bg-blue-100 text-blue-900">Primary</Badge>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={insuranceBusy}
                        onClick={() => void makePrimaryInsurance(ins.id)}
                      >
                        Set primary
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={insuranceBusy}
                      onClick={() => void removeInsurance(ins.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-600">No insurance on file yet.</p>
          )}

          <div className="border-t border-slate-200 pt-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Add insurance</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="insProvider">Insurance provider</Label>
                <Input
                  id="insProvider"
                  value={insProvider}
                  onChange={(e) => setInsProvider(e.target.value)}
                  placeholder="Demo Health Plan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insPlan">Plan name (optional)</Label>
                <Input
                  id="insPlan"
                  value={insPlan}
                  onChange={(e) => setInsPlan(e.target.value)}
                  placeholder="PPO Gold"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="insMemberId">Member ID (optional)</Label>
                  <Input
                    id="insMemberId"
                    value={insMemberId}
                    onChange={(e) => setInsMemberId(e.target.value)}
                    placeholder="DEMO-000123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insGroup">Group number (optional)</Label>
                  <Input
                    id="insGroup"
                    value={insGroup}
                    onChange={(e) => setInsGroup(e.target.value)}
                    placeholder="GRP-1000"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={insPrimary}
                  onChange={(e) => setInsPrimary(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Mark as primary insurance
              </label>
              <Button type="button" disabled={insuranceBusy} onClick={() => void addInsurance()}>
                {insuranceBusy ? "Adding…" : "Add insurance"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected health devices</CardTitle>
          <CardDescription>
            Link wearable devices to associate wellness context with documents you upload. When
            connected devices surface concerning indicators, CareBridge sends that information to
            the doctors and physicians associated with your care through this platform.
            Choose a device below to open that vendor&apos;s instructions for linking to a health
            app on your phone. This prototype simulates the CareBridge link afterward — no live
            data is sent to vendors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {connected.length > 0 && (
            <ul className="space-y-3">
              {connected.map((d) => (
                <li
                  key={d.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">{d.displayName}</p>
                    <p className="text-xs text-slate-500">
                      Connected {formatDateTime(d.connectedAt)}
                      {d.lastSyncAt ? ` · Last sync ${formatDateTime(d.lastSyncAt)}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-900">Connected</Badge>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void disconnectDevice(d.id)}
                    >
                      Disconnect
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div>
            <p className="mb-3 text-sm font-medium text-slate-800">Add a device</p>
            <div className="flex flex-wrap gap-2">
              {DEVICE_OPTIONS.map((type) => {
                const isConnected = connected.some((d) => d.deviceType === type);
                return (
                  <Button
                    key={type}
                    type="button"
                    variant={isConnected ? "secondary" : "outline"}
                    size="sm"
                    disabled={isConnected || connecting === type}
                    onClick={() => startDeviceConnect(type)}
                  >
                    {connecting === type ? "Connecting…" : HEALTH_DEVICE_LABELS[type]}
                    {isConnected ? " ✓" : ""}
                  </Button>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-slate-500">
            When you upload lab reports or clinical documents, CareBridge can record which connected
            devices were linked to your account at upload time (demo logging only).
          </p>
        </CardContent>
      </Card>

      {pendingDevice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="connect-device-title"
        >
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader>
              <CardTitle id="connect-device-title">
                Connect {HEALTH_DEVICE_LABELS[pendingDevice]}
              </CardTitle>
              <CardDescription>
                Open {HEALTH_DEVICE_LABELS[pendingDevice]}&apos;s setup guide to link your device to
                a health app on your phone (for example Apple Health or Samsung Health). Follow their
                steps there, then confirm below to mark the device connected in this CareBridge demo.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                className="sm:flex-1"
                onClick={() => openDeviceGuide(pendingDevice)}
              >
                Open setup guide
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="sm:flex-1"
                disabled={connecting === pendingDevice}
                onClick={() => void connectDevice(pendingDevice)}
              >
                {connecting === pendingDevice ? "Connecting…" : "I've linked my device"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="sm:w-full"
                onClick={() => setPendingDevice(null)}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
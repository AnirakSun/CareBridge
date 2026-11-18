"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type OrgSummary = {
  id: string;
  name: string;
  slug: string;
  type?: string;
  city: string;
  state: string;
};

type PhysicianRow = {
  id: string;
  provider: {
    id: string;
    name: string;
    title: string;
    specialty: string;
    email: string | null;
    phone: string | null;
    department: string | null;
    organization: { id: string; name: string; slug: string };
  };
};

type ViewData = {
  organizations: Array<{
    membershipId: string | null;
    viaSubmissionOnly: boolean;
    organization: OrgSummary;
  }>;
  physicians: PhysicianRow[];
  availableOrganizations: OrgSummary[];
  linkedOrganizationIds: string[];
};

type ProviderOption = {
  id: string;
  name: string;
  title: string;
  specialty: string;
};

export function MyOrganizationsClient({ initial }: { initial: ViewData }) {
  const [data, setData] = useState(initial);
  const [orgToAdd, setOrgToAdd] = useState("");
  const [physicianOrgId, setPhysicianOrgId] = useState("");
  const [providerOptions, setProviderOptions] = useState<ProviderOption[]>([]);
  const [providerToAdd, setProviderToAdd] = useState("");
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [busy, setBusy] = useState(false);

  async function addOrganization(organizationId?: string) {
    const id = organizationId ?? orgToAdd;
    if (!id) return;
    setBusy(true);
    try {
      const res = await fetch("/api/my-organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: id }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Could not add organization");
        return;
      }
      setData(json as ViewData);
      if (!organizationId) setOrgToAdd("");
      toast.success("Organization linked");
    } finally {
      setBusy(false);
    }
  }

  async function removeOrganization(organizationId: string) {
    setBusy(true);
    try {
      const res = await fetch(
        `/api/my-organizations?organizationId=${encodeURIComponent(organizationId)}`,
        { method: "DELETE" },
      );
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Could not remove organization");
        return;
      }
      setData(json as ViewData);
      if (physicianOrgId === organizationId) {
        setPhysicianOrgId("");
        setProviderOptions([]);
        setProviderToAdd("");
      }
      toast.success("Organization removed from your list");
    } finally {
      setBusy(false);
    }
  }

  async function loadProvidersForOrg(organizationId: string) {
    setPhysicianOrgId(organizationId);
    setProviderToAdd("");
    if (!organizationId) {
      setProviderOptions([]);
      return;
    }
    setLoadingProviders(true);
    try {
      const res = await fetch(
        `/api/my-organizations/providers?organizationId=${encodeURIComponent(organizationId)}`,
      );
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Could not load physicians");
        setProviderOptions([]);
        return;
      }
      setProviderOptions(json.providers as ProviderOption[]);
    } finally {
      setLoadingProviders(false);
    }
  }

  async function addPhysician() {
    if (!providerToAdd) return;
    setBusy(true);
    try {
      const res = await fetch("/api/my-organizations/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careProviderId: providerToAdd }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Could not add physician");
        return;
      }
      setData(json as ViewData);
      setProviderToAdd("");
      toast.success("Physician added to your care team");
    } finally {
      setBusy(false);
    }
  }

  async function removePhysician(careProviderId: string) {
    setBusy(true);
    try {
      const res = await fetch(
        `/api/my-organizations/providers?careProviderId=${encodeURIComponent(careProviderId)}`,
        { method: "DELETE" },
      );
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Could not remove physician");
        return;
      }
      setData(json as ViewData);
      toast.success("Physician removed");
    } finally {
      setBusy(false);
    }
  }

  const orgOptionsForPhysicians = data.organizations.map((o) => o.organization);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your organizations</CardTitle>
          <CardDescription>
            Organizations you are linked with in CareBridge. Concern signals from connected devices
            and your submissions can be shared with physicians at these sites.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.organizations.length === 0 ? (
            <p className="text-sm text-slate-600">
              You have not linked any organizations yet. Add one below or upload a document to an
              organization from the directory.
            </p>
          ) : (
            <ul className="space-y-3">
              {data.organizations.map(({ organization, viaSubmissionOnly, membershipId }) => (
                <li
                  key={organization.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <Link
                      href={`/organizations/${organization.slug}`}
                      className="font-medium text-blue-800 hover:underline"
                    >
                      {organization.name}
                    </Link>
                    <p className="text-sm text-slate-600">
                      {organization.city}, {organization.state}
                      {viaSubmissionOnly ? " · Linked via document upload" : ""}
                    </p>
                  </div>
                  {membershipId ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => void removeOrganization(organization.id)}
                    >
                      Remove link
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => void addOrganization(organization.id)}
                    >
                      Save to my list
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-slate-200 pt-4">
            <p className="mb-2 text-sm font-medium text-slate-800">Add organization</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                className="h-10 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={orgToAdd}
                onChange={(e) => setOrgToAdd(e.target.value)}
                aria-label="Organization to add"
              >
                <option value="">Select organization…</option>
                {data.availableOrganizations.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} · {o.city}, {o.state}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                disabled={!orgToAdd || busy}
                onClick={() => void addOrganization()}
              >
                Add
              </Button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Browse the{" "}
              <Link href="/organizations" className="text-blue-700 hover:underline">
                organizations directory
              </Link>{" "}
              for facility details.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your physicians</CardTitle>
          <CardDescription>
            Doctors and clinicians associated with your linked organizations whom you want involved
            in your CareBridge care team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.physicians.length === 0 ? (
            <p className="text-sm text-slate-600">
              No physicians on your list yet. Choose a linked organization and add providers from
              their directory.
            </p>
          ) : (
            <ul className="space-y-3">
              {data.physicians.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {row.provider.name}, {row.provider.title}
                    </p>
                    <p className="text-sm text-slate-600">{row.provider.specialty}</p>
                    <p className="text-sm text-slate-500">
                      {row.provider.organization.name}
                      {row.provider.department ? ` · ${row.provider.department}` : ""}
                    </p>
                    {(row.provider.email || row.provider.phone) && (
                      <p className="mt-1 text-xs text-slate-500">
                        {[row.provider.email, row.provider.phone].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => void removePhysician(row.provider.id)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-slate-200 pt-4">
            <p className="mb-2 text-sm font-medium text-slate-800">Add physician</p>
            {orgOptionsForPhysicians.length === 0 ? (
              <p className="text-sm text-slate-600">Link an organization first to add physicians.</p>
            ) : (
              <div className="space-y-3">
                <select
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                  value={physicianOrgId}
                  onChange={(e) => void loadProvidersForOrg(e.target.value)}
                  aria-label="Organization for physician"
                >
                  <option value="">Select linked organization…</option>
                  {orgOptionsForPhysicians.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
                {loadingProviders && (
                  <p className="text-sm text-slate-500">Loading physicians…</p>
                )}
                {!loadingProviders && physicianOrgId && providerOptions.length === 0 && (
                  <p className="text-sm text-slate-500">No physicians listed for this organization.</p>
                )}
                {providerOptions.length > 0 && (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <select
                      className="h-10 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm"
                      value={providerToAdd}
                      onChange={(e) => setProviderToAdd(e.target.value)}
                      aria-label="Physician to add"
                    >
                      <option value="">Select physician…</option>
                      {providerOptions
                        .filter((p) => !data.physicians.some((ph) => ph.provider.id === p.id))
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — {p.specialty}
                          </option>
                        ))}
                    </select>
                    <Button
                      type="button"
                      disabled={!providerToAdd || busy}
                      onClick={() => void addPhysician()}
                    >
                      Add physician
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-slate-500">
        Demo only: care-team links are stored locally and do not contact real clinicians.
      </p>
    </div>
  );
}
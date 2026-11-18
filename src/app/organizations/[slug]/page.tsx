import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Clock,
  Globe,
  MapPin,
  Phone,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProviderAvatar } from "@/components/organizations/provider-avatar";
import { SpecialtyLink } from "@/components/organizations/specialty-link";
import { externalWebsiteUrl, websiteDisplayLabel } from "@/lib/external-url";
import { specialtyHasPage, specialtyPageHref } from "@/lib/organization-specialties";
import { getOrganizationBySlug } from "@/server/services/organizations";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await getOrganizationBySlug(slug);
  if (!org) notFound();

  const providers = org.providers ?? [];
  const primaryProviders = providers.filter((p) => p.isPrimaryCare);
  const otherProviders = providers.filter((p) => !p.isPrimaryCare);
  const facilities = org.facilities ?? [];
  const specialties = org.specialties ?? [];
  const orgWebsite = org.website ? externalWebsiteUrl(org.website) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/organizations">
          <ArrowLeft className="h-4 w-4" /> Back to directory
        </Link>
      </Button>

      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-700" aria-hidden />
              <Badge className="capitalize bg-blue-100 text-blue-800">{org.type}</Badge>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">{org.name}</h1>
            <p className="mt-2 text-slate-600">{org.description}</p>
          </div>
          <Button asChild className="shrink-0">
            <Link href={`/dashboard/submissions/new?organizationId=${org.id}`}>
              Submit documents here
            </Link>
          </Button>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(org.streetAddress || org.city) && (
            <div className="flex gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              <div>
                <dt className="font-medium text-slate-900">Main campus</dt>
                <dd className="text-slate-600">
                  {org.streetAddress && <span>{org.streetAddress}<br /></span>}
                  {org.city}, {org.state} {org.zipCode}
                </dd>
              </div>
            </div>
          )}
          {org.phone && (
            <div className="flex gap-2 text-sm">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              <div>
                <dt className="font-medium text-slate-900">Phone</dt>
                <dd className="text-slate-600">{org.phone}</dd>
              </div>
            </div>
          )}
          {orgWebsite && (
            <div className="flex min-w-0 gap-2 text-sm">
              <Globe className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              <div className="min-w-0">
                <dt className="font-medium text-slate-900">Official website</dt>
                <dd className="min-w-0">
                  <a
                    href={orgWebsite}
                    className="block min-w-0 break-all font-medium text-blue-700 hover:underline sm:break-words"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={websiteDisplayLabel(org.website!)}
                  >
                    {websiteDisplayLabel(org.website!)}
                  </a>
                </dd>
              </div>
            </div>
          )}
          {org.hoursOverview && (
            <div className="flex gap-2 text-sm sm:col-span-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              <div>
                <dt className="font-medium text-slate-900">Hours</dt>
                <dd className="text-slate-600">{org.hoursOverview}</dd>
              </div>
            </div>
          )}
        </dl>

        {org.patientPopulation && (
          <p className="mt-4 text-sm text-slate-700">
            <span className="font-medium">Who we serve:</span> {org.patientPopulation}
          </p>
        )}
        {org.accreditations && (
          <p className="mt-2 text-sm text-slate-700">
            <span className="font-medium">Accreditations:</span> {org.accreditations}
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-blue-700" />
              Specialties & focus areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {specialties.length === 0 ? (
              <p className="text-sm text-slate-600">No specialty information listed.</p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {specialties.map((s) => (
                  <li key={s.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    {specialtyHasPage(s) ? (
                      <Link
                        href={specialtyPageHref(org.slug, s.name)}
                        className="font-medium text-blue-800 hover:underline"
                      >
                        {s.name}
                      </Link>
                    ) : (
                      <p className="font-medium text-slate-900">{s.name}</p>
                    )}
                    <p className="mt-1 text-sm text-slate-600">{s.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-700" />
              Facilities & locations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {facilities.length === 0 ? (
              <p className="text-sm text-slate-600">No facility details listed.</p>
            ) : (
              facilities.map((f) => (
                <div key={f.id} className="rounded-lg border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{f.name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {f.address}, {f.city}, {f.state}
                  </p>
                  {f.phone && <p className="text-sm text-slate-600">Phone: {f.phone}</p>}
                  <p className="mt-2 text-sm text-slate-700">{f.description}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-blue-700" />
              Primary care providers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {primaryProviders.length === 0 ? (
              <p className="text-sm text-slate-600">No primary care roster listed (demo data).</p>
            ) : (
              primaryProviders.map((p) => (
                <ProviderCard key={p.id} orgSlug={org.slug} specialties={specialties} provider={p} />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Specialists & clinical leads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {otherProviders.length === 0 ? (
              <p className="text-sm text-slate-600">No additional providers listed.</p>
            ) : (
              otherProviders.map((p) => (
                <ProviderCard key={p.id} orgSlug={org.slug} specialties={specialties} provider={p} />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <p className="mt-8 text-center text-xs text-slate-500">
        All names, portraits, and profiles are fictional demo data — not real clinicians or
        patients.
      </p>
    </div>
  );
}

function ProviderCard({
  orgSlug,
  specialties,
  provider,
}: {
  orgSlug: string;
  specialties: Array<{ id: string; name: string; description: string }>;
  provider: {
    name: string;
    title: string;
    specialty: string;
    credentials: string;
    bio: string;
    email?: string | null;
    phone?: string | null;
    department?: string | null;
    photoUrl?: string | null;
  };
}) {
  return (
    <div className="flex gap-4 rounded-lg border border-slate-100 p-4">
      <ProviderAvatar name={provider.name} photoUrl={provider.photoUrl} size={80} />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-900">
          {provider.name}, {provider.credentials}
        </p>
        <p className="text-sm text-slate-800">
          {provider.title} ·{" "}
          <SpecialtyLink orgSlug={orgSlug} label={provider.specialty} specialties={specialties} />
        </p>
        {provider.department && (
          <p className="mt-1 text-xs text-slate-500">{provider.department}</p>
        )}
        {(provider.phone || provider.email) && (
          <dl className="mt-2 space-y-1 text-sm text-slate-700">
            {provider.phone && (
              <div>
                <dt className="inline font-medium">Phone: </dt>
                <dd className="inline">{provider.phone}</dd>
              </div>
            )}
            {provider.email && (
              <div>
                <dt className="inline font-medium">Email: </dt>
                <dd className="inline">
                  <a href={`mailto:${provider.email}`} className="text-blue-700 hover:underline">
                    {provider.email}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        )}
        <p className="mt-2 text-sm text-slate-600">{provider.bio}</p>
      </div>
    </div>
  );
}

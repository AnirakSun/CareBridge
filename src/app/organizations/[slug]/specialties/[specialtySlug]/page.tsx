import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Globe, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProviderAvatar } from "@/components/organizations/provider-avatar";
import {
  findMatchingSpecialty,
  findSpecialtyBySlug,
  specialtyHasPage,
} from "@/lib/organization-specialties";
import { externalWebsiteUrl, websiteDisplayLabel } from "@/lib/external-url";
import { getOrganizationBySlug } from "@/server/services/organizations";

export default async function OrganizationSpecialtyPage({
  params,
}: {
  params: Promise<{ slug: string; specialtySlug: string }>;
}) {
  const { slug, specialtySlug } = await params;
  const org = await getOrganizationBySlug(slug);
  if (!org) notFound();

  const specialties = org.specialties ?? [];
  const specialty = findSpecialtyBySlug(specialties, specialtySlug);
  if (!specialty || !specialtyHasPage(specialty)) notFound();

  const providers = (org.providers ?? []).filter(
    (p) => findMatchingSpecialty(specialties, p.specialty)?.id === specialty.id,
  );
  const website = org.website ? externalWebsiteUrl(org.website) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href={`/organizations/${org.slug}`}>
          <ArrowLeft className="h-4 w-4" /> Back to {org.name}
        </Link>
      </Button>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Stethoscope className="h-6 w-6 text-blue-700" aria-hidden />
        <Badge className="bg-blue-100 text-blue-800">{org.name}</Badge>
      </div>

      <h1 className="text-3xl font-bold text-slate-900">{specialty.name}</h1>
      <p className="mt-4 text-lg text-slate-700">{specialty.description}</p>

      {website && (
        <p className="mt-4 text-sm text-slate-600">
          <Globe className="mr-1 inline h-4 w-4" aria-hidden />
          Organization site:{" "}
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-700 hover:underline"
          >
            {websiteDisplayLabel(org.website!)}
          </a>
        </p>
      )}

      {providers.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Providers in this specialty</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {providers.map((p) => (
              <div key={p.id} className="flex gap-4 rounded-lg border border-slate-200 p-4">
                <ProviderAvatar name={p.name} photoUrl={p.photoUrl} size={72} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">
                    {p.name}, {p.credentials}
                  </p>
                  <p className="text-sm text-slate-600">
                    {p.title}
                    {p.department ? ` · ${p.department}` : ""}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">{p.bio}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <p className="mt-8 text-xs text-slate-500">
        Demo specialty content — fictional, not clinical advice.
      </p>
    </div>
  );
}
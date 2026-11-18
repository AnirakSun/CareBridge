import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { externalWebsiteUrl, websiteDisplayLabel } from "@/lib/external-url";
import { listActiveOrganizations } from "@/server/services/organizations";

export const dynamic = "force-dynamic";

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const organizations = await listActiveOrganizations(q);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Healthcare organizations</h1>
        <p className="mt-2 text-slate-600">
          Fictional participating organizations available for document submissions in this demo.
        </p>
        <form className="mt-4 max-w-md" method="get">
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by name, city, or type…"
            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
          />
        </form>
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {organizations.map((org) => (
          <Card key={org.id} className="flex min-w-0 flex-col overflow-hidden">
            <CardHeader className="min-w-0">
              <Building2 className="mb-2 h-5 w-5 text-blue-700" aria-hidden />
              <CardTitle className="text-lg break-words">
                <Link href={`/organizations/${org.slug}`} className="hover:text-blue-700">
                  {org.name}
                </Link>
              </CardTitle>
              <CardDescription className="capitalize">
                {org.type} · {org.city}, {org.state}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex min-w-0 flex-1 flex-col">
              <p className="flex-1 text-sm text-slate-700">{org.description}</p>
              {org.website && externalWebsiteUrl(org.website) && (
                <p className="mt-3 min-w-0 text-sm">
                  <a
                    href={externalWebsiteUrl(org.website)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={websiteDisplayLabel(org.website)}
                    className="block min-w-0 truncate text-blue-700 hover:underline"
                  >
                    {websiteDisplayLabel(org.website, 36)}
                  </a>
                </p>
              )}
              <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                <Link href={`/organizations/${org.slug}`}>
                  View details <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {organizations.length === 0 && (
        <p className="text-center text-slate-600">No organizations match your search.</p>
      )}
    </div>
  );
}

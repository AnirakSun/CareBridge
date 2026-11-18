import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeFeatureCards } from "@/components/home/home-feature-cards";
import { HospitalBackdrop } from "@/components/home/hospital-backdrop";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/constants";
import { getCurrentUser } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="relative isolate">
      <HospitalBackdrop />
      <section className="relative border-b border-slate-200/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="max-w-3xl rounded-2xl border border-white/70 bg-white/85 p-8 shadow-lg shadow-slate-200/40 backdrop-blur-md sm:p-10">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-700">
              Bridging The Gap Between Healthcare and Workflow
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Share documents securely with care organizations
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              CareBridge helps patients and coordinators submit lab reports and clinical documents,
              track review status, and communicate with authorized hospital administrators — using
              synthetic demo data only.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <>
                  <Button asChild size="lg">
                    <Link
                      href={
                        user.role === ROLES.ADMIN ? "/admin" : "/dashboard/submissions/new"
                      }
                    >
                      {user.role === ROLES.ADMIN ? "Open admin queue" : "Upload & submit"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/organizations">Choose recipient</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link href="/register">
                      Get started <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/login">Log in</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <HomeFeatureCards isLoggedIn={Boolean(user)} role={user?.role ?? null} />
    </div>
  );
}
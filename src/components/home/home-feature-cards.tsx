import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { ROLES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    id: "upload",
    title: "Upload & submit",
    description: "Send PDF, DOCX, JPG, and PNG files to a care organization with tracking.",
    image: "/features/upload-submit.svg",
    imageAlt: "Illustration of uploading a medical document",
  },
  {
    id: "recipient",
    title: "Choose recipient",
    description: "Browse hospitals, labs, and clinics — including Northwell, NYU Langone, and more.",
    image: "/features/choose-recipient.svg",
    imageAlt: "Illustration of selecting a healthcare facility",
  },
  {
    id: "messaging",
    title: "Direct messaging",
    description: "Message administrators on each submission with a persistent thread.",
    image: "/features/direct-messaging.svg",
    imageAlt: "Illustration of a secure chat thread",
  },
  {
    id: "access",
    title: "Role-based access",
    description: "Submitters and organization admins each see only what they are allowed to access.",
    image: "/features/role-access.svg",
    imageAlt: "Illustration of protected access roles",
  },
] as const;

type Props = {
  isLoggedIn: boolean;
  role: string | null;
};

function hrefForFeature(id: (typeof FEATURES)[number]["id"], role: string | null): string {
  switch (id) {
    case "upload":
      return role === ROLES.ADMIN ? "/admin" : "/dashboard/submissions/new";
    case "recipient":
      return "/organizations";
    case "messaging":
      return role === ROLES.ADMIN ? "/admin" : "/dashboard";
    case "access":
      return role === ROLES.ADMIN ? "/admin" : "/dashboard";
    default:
      return "/dashboard";
  }
}

function FeatureCard({
  feature,
  href,
  isLoggedIn,
}: {
  feature: (typeof FEATURES)[number];
  href: string;
  isLoggedIn: boolean;
}) {
  const body = (
    <Card
      className={cn(
        "flex h-full flex-col overflow-hidden transition-shadow",
        isLoggedIn && "cursor-pointer hover:border-blue-300 hover:shadow-md",
      )}
    >
      <div className="relative aspect-[16/10] w-full shrink-0 bg-slate-50">
        <Image
          src={feature.image}
          alt={feature.imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <CardHeader className="shrink-0 pb-2">
        <CardTitle className="text-lg">{feature.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pb-6">
        <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
        <div className="mt-auto pt-5">
          {isLoggedIn ? (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-700">
              Open <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
          ) : (
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href={`/login?next=${encodeURIComponent(href)}`}>Log in to continue</Link>
            </Button>
          )}
        </div>
        {!isLoggedIn && (
          <p className="mt-2 flex items-center justify-center gap-1 text-center text-xs text-slate-500">
            <Lock className="h-3 w-3 shrink-0" aria-hidden />
            Sign in required
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (isLoggedIn) {
    return (
      <Link
        href={href}
        className="flex h-full min-h-[380px] flex-col rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        {body}
      </Link>
    );
  }

  return <div className="flex h-full min-h-[380px] flex-col">{body}</div>;
}

export function HomeFeatureCards({ isLoggedIn, role }: Props) {
  return (
    <section className="relative border-b border-slate-200/50 bg-white/75 py-16 backdrop-blur-sm sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900">What you can do with CareBridge</h2>
          <p className="mt-2 text-slate-600">
            {isLoggedIn
              ? "Select an option below to get started."
              : "Sign in to open these workflows — previews are shown below."}
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              href={hrefForFeature(feature.id, role)}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
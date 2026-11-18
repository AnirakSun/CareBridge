"use client";

import Link from "next/link";
import { Stethoscope, UserRound } from "lucide-react";
import type { AuthActionState } from "@/server/auth";
import { loginAction } from "@/server/auth";
import { AuthFooterLink, AuthForm } from "@/components/auth/auth-form";

type Props = {
  searchParams?: { next?: string };
};

function LoginCard({
  variant,
  icon: Icon,
  title,
  description,
  demoHint,
  action,
}: {
  variant: "patient" | "provider";
  icon: typeof UserRound;
  title: string;
  description: string;
  demoHint: string;
  action: (prev: AuthActionState, formData: FormData) => Promise<AuthActionState>;
}) {
  return (
    <div className="flex h-full flex-col">
      <CardShell
        icon={Icon}
        title={title}
        description={description}
        demoHint={demoHint}
        variant={variant}
        action={action}
      />
    </div>
  );
}

function CardShell({
  icon: Icon,
  title,
  description,
  demoHint,
  variant,
  action,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
  demoHint: string;
  variant: "patient" | "provider";
  action: (prev: AuthActionState, formData: FormData) => Promise<AuthActionState>;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div
        className={
          variant === "patient"
            ? "rounded-t-xl border-b border-blue-100 bg-blue-50 px-3 py-3 sm:px-6 sm:py-4"
            : "rounded-t-xl border-b border-slate-200 bg-slate-50 px-3 py-3 sm:px-6 sm:py-4"
        }
      >
        <div className="flex items-center gap-2 text-blue-900">
          <Icon className="h-5 w-5 text-blue-700" aria-hidden />
          <h2 className="text-sm font-semibold sm:text-lg">{title}</h2>
        </div>
        <p className="mt-1 text-xs text-slate-600 sm:text-sm">{description}</p>
      </div>
      <FormWrapper>
        <AuthForm
          title=""
          description=""
          submitLabel={variant === "patient" ? "Log in as patient" : "Log in as provider"}
          action={action}
          fields={["email", "password"]}
          hideHeader
          fieldIdPrefix={variant}
          hiddenFields={{ accountType: variant }}
          footer={
            variant === "patient" ? (
              <AuthFooterLink text="New patient?" href="/register" linkText="Create account" />
            ) : (
              <p className="text-xs text-slate-500">
                Provider accounts are created by your organization administrator in this demo.
              </p>
            )
          }
        />
      </FormWrapper>
      <p className="border-t border-slate-100 px-3 py-2 text-[10px] leading-snug text-slate-500 sm:px-6 sm:py-3 sm:text-xs">
        {demoHint}
      </p>
    </div>
  );
}

function FormWrapper({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 px-2 pb-2 pt-0">{children}</div>;
}

export function LoginSplit({ searchParams }: Props) {
  const next = searchParams?.next;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Log in to CareBridge</h1>
        <p className="mt-2 text-slate-600">
          Choose the portal that matches your role — patients and providers use separate sign-in
          areas.
        </p>
        {next && (
          <p className="mt-1 text-sm text-blue-700">
            You will return to your requested page after signing in.
          </p>
        )}
      </div>

      <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-3 sm:gap-6 md:gap-8">
        <LoginCard
          variant="patient"
          icon={UserRound}
          title="Patient / user"
          description="Upload documents, track submissions, and message your care team."
          demoHint="Demo: submitter.a@carebridge.demo · Password123!"
          action={loginAction}
        />
        <LoginCard
          variant="provider"
          icon={Stethoscope}
          title="Provider / physician"
          description="Review organization submissions, update status, and reply to patients."
          demoHint="Demo: admin.riverside@carebridge.demo · Password123!"
          action={loginAction}
        />
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        <Link href="/" className="text-blue-700 hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
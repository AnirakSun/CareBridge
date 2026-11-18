"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { AuthActionState } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  title: string;
  description: string;
  submitLabel: string;
  action: (prev: AuthActionState, formData: FormData) => Promise<AuthActionState>;
  fields: Array<"name" | "email" | "password">;
  footer?: React.ReactNode;
  hideHeader?: boolean;
  fieldIdPrefix?: string;
  hiddenFields?: Record<string, string>;
};

const initial: AuthActionState = {};

export function AuthForm({
  title,
  description,
  submitLabel,
  action,
  fields,
  footer,
  hideHeader = false,
  fieldIdPrefix = "",
  hiddenFields,
}: Props) {
  const [state, formAction, pending] = useActionState(action, initial);
  const id = (field: string) => (fieldIdPrefix ? `${fieldIdPrefix}-${field}` : field);

  const formBody = (
    <form action={formAction} className="space-y-4">
          {hiddenFields &&
            Object.entries(hiddenFields).map(([key, value]) => (
              <input key={key} type="hidden" name={key} value={value} />
            ))}
          {fields.includes("name") && (
            <div className="space-y-2">
              <Label htmlFor={id("name")}>Full name</Label>
              <Input id={id("name")} name="name" autoComplete="name" required />
              {state.fieldErrors?.name?.[0] && (
                <p className="text-sm text-red-600">{state.fieldErrors.name[0]}</p>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor={id("email")}>Email</Label>
            <Input id={id("email")} name="email" type="email" autoComplete="email" required />
            {state.fieldErrors?.email?.[0] && (
              <p className="text-sm text-red-600">{state.fieldErrors.email[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={id("password")}>Password</Label>
            <Input
              id={id("password")}
              name="password"
              type="password"
              autoComplete={fields.includes("name") ? "new-password" : "current-password"}
              required
            />
            {state.fieldErrors?.password?.[0] && (
              <p className="text-sm text-red-600">{state.fieldErrors.password[0]}</p>
            )}
          </div>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button type="submit" className="w-full text-xs sm:text-sm" disabled={pending}>
            {pending ? "Please wait…" : submitLabel}
          </Button>
        </form>
  );

  if (hideHeader) {
    return (
      <NestedAuthPadding>
        {formBody}
        {footer && <div className="mt-4 text-center text-sm text-slate-600">{footer}</div>}
      </NestedAuthPadding>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {formBody}
        {footer && <div className="mt-4 text-center text-sm text-slate-600">{footer}</div>}
      </CardContent>
    </Card>
  );
}

function NestedAuthPadding({ children }: { children: React.ReactNode }) {
  return <div className="p-2 sm:p-4">{children}</div>;
}

export function AuthFooterLink({
  text,
  href,
  linkText,
}: {
  text: string;
  href: string;
  linkText: string;
}) {
  return (
    <p>
      {text}{" "}
      <Link href={href} className="font-medium text-blue-700 hover:underline">
        {linkText}
      </Link>
    </p>
  );
}

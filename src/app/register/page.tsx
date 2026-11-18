import { AuthFooterLink, AuthForm } from "@/components/auth/auth-form";
import { registerAction } from "@/server/auth";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <AuthForm
        title="Create submitter account"
        description="Register to upload documents and track submissions. Administrator accounts are provisioned separately."
        submitLabel="Create account"
        action={registerAction}
        fields={["name", "email", "password"]}
        footer={<AuthFooterLink text="Already registered?" href="/login" linkText="Log in" />}
      />
    </div>
  );
}

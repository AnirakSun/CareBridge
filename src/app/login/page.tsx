import { LoginSplit } from "@/components/auth/login-split";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return <LoginSplit searchParams={params} />;
}
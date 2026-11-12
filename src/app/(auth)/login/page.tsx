import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/auth/forms";
import { SetupNotice } from "@/components/site/setup-notice";
import { Alert } from "@/components/ui/alert";
import { isSupabaseConfigured } from "@/lib/env";
import { safeNextPath } from "@/lib/utils";
import { AuthCard } from "../auth-card";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? safeNextPath(params.next) : undefined;
  return (
    <AuthCard
      title="Welcome back"
      description="Log in to manage your projects and proposals."
      footer={<>New to FORGE? <Link href="/signup" className="font-medium text-primary hover:underline">Create an account</Link></>}
    >
      {!isSupabaseConfigured && <SetupNotice className="mb-5" />}
      {params.verified === "1" && <Alert variant="success" title="Email verified — you can log in now." className="mb-5" />}
      {next && <Alert variant="info" title="Please log in to continue." className="mb-5" />}
      <SignInForm next={next} disabled={!isSupabaseConfigured} />
    </AuthCard>
  );
}

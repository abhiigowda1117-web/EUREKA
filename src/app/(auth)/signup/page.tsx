import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/forms";
import { SetupNotice } from "@/components/site/setup-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { AuthCard } from "../auth-card";

export const metadata: Metadata = { title: "Create your account" };

export default function SignUpPage() {
  return (
    <AuthCard
      title="Join FORGE"
      description="One free account to post projects and to find work."
      footer={<>Already have an account? <Link href="/login" className="font-medium text-primary hover:underline">Log in</Link></>}
    >
      {!isSupabaseConfigured && <SetupNotice className="mb-5" />}
      <SignUpForm disabled={!isSupabaseConfigured} />
    </AuthCard>
  );
}

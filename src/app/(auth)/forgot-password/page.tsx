import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forms";
import { SetupNotice } from "@/components/site/setup-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { AuthCard } from "../auth-card";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your email and we'll send you a secure link to choose a new one."
      footer={<Link href="/login" className="font-medium text-primary hover:underline">Back to log in</Link>}
    >
      {!isSupabaseConfigured && <SetupNotice className="mb-5" />}
      <ForgotPasswordForm disabled={!isSupabaseConfigured} />
    </AuthCard>
  );
}

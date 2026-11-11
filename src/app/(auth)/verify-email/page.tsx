import { MailCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ResendVerificationForm } from "@/components/auth/forms";
import { isSupabaseConfigured } from "@/lib/env";
import { AuthCard } from "../auth-card";

export const metadata: Metadata = { title: "Verify your email" };

export default async function VerifyEmailPage({ searchParams }: PageProps<"/verify-email">) {
  const { email } = await searchParams;
  const address = typeof email === "string" ? email : undefined;
  return (
    <AuthCard
      title="Check your inbox"
      footer={<Link href="/login" className="font-medium text-primary hover:underline">Back to log in</Link>}
    >
      <div className="flex gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-5" aria-hidden />
        </span>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We sent a verification link{address ? <> to <strong className="text-foreground">{address}</strong></> : null}.
          Click it to activate your account. Check your spam folder if you don&apos;t see it within a few minutes.
        </p>
      </div>
      <div className="mt-7 border-t border-border pt-6">
        <p className="mb-4 text-sm text-muted-foreground">Didn&apos;t get it?</p>
        <ResendVerificationForm email={address} disabled={!isSupabaseConfigured} />
      </div>
    </AuthCard>
  );
}

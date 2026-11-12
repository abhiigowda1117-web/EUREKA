import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/forms";
import { requireUser } from "@/lib/auth";
import { AuthCard } from "../auth-card";

export const metadata: Metadata = { title: "Choose a new password" };

// Reached from the password-reset email: /auth/confirm signs the user in, then sends them here.
export default async function ResetPasswordPage() {
  await requireUser("/reset-password");
  return (
    <AuthCard title="Choose a new password" description="Pick something you haven't used on other websites.">
      <ResetPasswordForm />
    </AuthCard>
  );
}

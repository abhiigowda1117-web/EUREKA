import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile, requireUser } from "@/lib/auth";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = { title: "Set up your profile" };

/** Suggest a username from the user's name, e.g. "Asha Rao" -> "asha_rao". */
function suggestUsername(name: string, email: string) {
  const base = (name || email.split("@")[0] || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
  return base.length >= 3 ? base : "";
}

export default async function OnboardingPage() {
  const user = await requireUser("/onboarding");
  const profile = await getCurrentProfile();
  if (profile?.username && profile.onboarded_at) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Step 1 of 2</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome to FORGE</h1>
      <p className="mt-2 text-muted-foreground">Let&apos;s set up the basics. Next, you&apos;ll add skills and a photo.</p>
      <div className="mt-8 rounded-2xl border border-border-strong bg-card p-6 sm:p-8 card-glow">
        <OnboardingForm
          defaultName={profile?.full_name ?? ""}
          defaultUsername={suggestUsername(profile?.full_name ?? "", user.email)}
        />
      </div>
    </div>
  );
}

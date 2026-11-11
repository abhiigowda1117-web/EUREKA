import { FileText } from "lucide-react";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "Post a project" };

// Milestone 2 replaces this with the full project form. The route already
// requires a logged-in, onboarded account, which is what the form will need.
export default async function NewProjectPage() {
  await requireProfile("/projects/new");
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Post a project</h1>
      <EmptyState
        className="mt-8"
        icon={FileText}
        title="Project posting opens in Milestone 2"
        description="Your account is ready. While we finish the project form, complete your profile so freelancers can trust you."
        action={<ButtonLink href="/settings/profile">Complete your profile</ButtonLink>}
      />
    </div>
  );
}

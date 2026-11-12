import { LinkIcon } from "lucide-react";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Link expired" };

export default function AuthErrorPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <LinkIcon className="size-5" aria-hidden />
      </span>
      <h1 className="mt-5 text-2xl font-semibold">This link is invalid or has expired</h1>
      <p className="mt-2 text-muted-foreground">
        Email links work once and expire after a while. Request a new one and use it from the same browser if possible.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/verify-email">Resend verification</ButtonLink>
        <ButtonLink href="/forgot-password" variant="secondary">Reset password</ButtonLink>
      </div>
    </div>
  );
}

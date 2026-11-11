"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

// Catches unexpected errors in any page so users see a friendly screen, not a crash.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-28 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">An unexpected error occurred. Please try again.</p>
      {error.digest && <p className="mt-2 font-mono text-xs text-subtle-foreground">Reference: {error.digest}</p>}
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="secondary">Go home</ButtonLink>
      </div>
    </div>
  );
}

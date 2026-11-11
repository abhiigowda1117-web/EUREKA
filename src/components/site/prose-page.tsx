import type { ReactNode } from "react";
import { Alert } from "@/components/ui/alert";

export function ProsePage({ title, updated, draft, children }: { title: string; updated: string; draft?: boolean; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated {updated}</p>
      {draft && (
        <Alert variant="warning" title="Draft — not yet reviewed by a lawyer" className="mt-6">
          This document is a working draft for FORGE&apos;s early access period and must be reviewed by a qualified legal professional before public launch.
        </Alert>
      )}
      <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-muted-foreground [&_h2]:mb-3 [&_h2]:scroll-mt-24 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_strong]:text-foreground [&_ul]:space-y-1.5">
        {children}
      </div>
    </article>
  );
}

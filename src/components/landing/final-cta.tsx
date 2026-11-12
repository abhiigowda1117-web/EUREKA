import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/25 via-card to-surface px-6 py-14 text-center sm:px-12 sm:py-20">
        <div aria-hidden className="absolute inset-0 -z-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="relative">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">Turn skills into opportunities.</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground sm:text-lg">
            Join FORGE today — post your first project or start building your freelance reputation.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/signup" size="lg">Create free account <ArrowRight aria-hidden /></ButtonLink>
            <ButtonLink href="/projects" size="lg" variant="secondary">Explore Projects</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

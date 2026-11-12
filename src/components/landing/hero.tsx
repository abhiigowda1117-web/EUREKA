import { ArrowRight, BadgeCheck, CalendarClock, IndianRupee, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
      {/* Background: grid + animated glow. Purely decorative. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      <div aria-hidden className="absolute left-1/2 top-[-12rem] -z-10 h-[36rem] w-[60rem] -translate-x-1/2 animate-glow rounded-full bg-[radial-gradient(closest-side,rgb(59_130_246/0.35),rgb(34_211_238/0.12)_60%,transparent)] blur-2xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
        <div className="animate-fade-up text-center lg:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-blue-200">
            <Sparkles className="size-3.5" aria-hidden /> Built for India&apos;s student talent
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-[4.25rem]">
            <span className="text-gradient">Your Skills Deserve an Opportunity.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground text-pretty lg:mx-0">
            Discover projects, connect with talented people, and turn your skills into real-world opportunities.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <ButtonLink href="/projects" size="lg">
              Explore Projects <ArrowRight aria-hidden />
            </ButtonLink>
            <ButtonLink href="/projects/new" size="lg" variant="secondary">
              Post a Project
            </ButtonLink>
          </div>
          <p className="mt-6 text-sm text-subtle-foreground">Free to join · One account to hire and to work · Prices in ₹</p>
        </div>

        <HeroIllustration />
      </div>
    </section>
  );
}

/** A stylised preview of the product. It's an illustration, so it's hidden from screen readers. */
function HeroIllustration() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-md select-none lg:max-w-none">
      <div className="animate-float rounded-2xl border border-border-strong bg-card/90 p-5 shadow-2xl backdrop-blur card-glow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-primary">Website Development</span>
          <span className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[11px] text-emerald-300">Open</span>
        </div>
        <p className="mt-2 font-semibold">Landing page for a campus food startup</p>
        <p className="mt-1 text-sm text-muted-foreground">Responsive site with menu, order form and Instagram feed.</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {["Next.js", "Tailwind CSS", "Figma"].map((s) => (
            <span key={s} className="rounded-full border border-border-strong px-2.5 py-0.5 text-xs text-muted-foreground">{s}</span>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
          <span className="inline-flex items-center gap-1 font-semibold"><IndianRupee className="size-4" />8,000 – 12,000</span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><CalendarClock className="size-3.5" />2 weeks</span>
        </div>
      </div>

      <div className="absolute -bottom-16 -left-4 w-64 animate-float rounded-xl border border-border-strong bg-surface/95 p-4 shadow-2xl backdrop-blur [animation-delay:-2s] sm:-left-10">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold">AK</span>
          <div>
            <p className="text-sm font-medium">New proposal</p>
            <p className="text-xs text-muted-foreground">₹9,500 · 10 days</p>
          </div>
        </div>
      </div>

      <div className="absolute -right-2 -top-8 hidden animate-float items-center gap-2 rounded-full border border-border-strong bg-surface/95 px-3 py-2 text-xs shadow-xl [animation-delay:-4s] sm:flex">
        <BadgeCheck className="size-4 text-primary" /> Email verified
      </div>
    </div>
  );
}

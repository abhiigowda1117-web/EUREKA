import { FileText, Handshake, Search, Star } from "lucide-react";
import { Section, SectionHeading } from "./section";

const steps = [
  { icon: FileText, title: "Post or discover", body: "Clients post a project with scope, budget in ₹ and a deadline. Freelancers browse and filter what fits their skills." },
  { icon: Search, title: "Propose and compare", body: "Freelancers send a proposal with their price, approach and timeline. Clients compare profiles, portfolios and reviews side by side." },
  { icon: Handshake, title: "Agree and collaborate", body: "The client accepts one proposal, both sides confirm the deliverables, and work happens over secure project messaging." },
  { icon: Star, title: "Deliver and review", body: "The freelancer submits the work, the client marks it complete, and both leave honest reviews that build reputation." },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" className="border-t border-border">
      <SectionHeading
        eyebrow="How FORGE works"
        title="From problem to finished work in four steps"
        description="A clear, transparent flow for both sides — no middlemen, no guesswork."
      />
      <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <li key={step.title} className="relative rounded-xl border border-border bg-card p-6 card-glow">
            <span className="absolute right-5 top-5 font-mono text-xs text-subtle-foreground">0{i + 1}</span>
            <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <step.icon className="size-5" aria-hidden />
            </span>
            <h3 className="mt-5 font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

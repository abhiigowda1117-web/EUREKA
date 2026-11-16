import { FileText, Star, UserRound } from "lucide-react";
import { Section, SectionHeading } from "./section";

const steps = [
  { icon: UserRound, title: "Create your profile", body: "Choose whether you want to work, give projects, or both. Add your skills." },
  { icon: FileText, title: "Post or find a project", body: "Clients post work with a budget in ₹. Students send proposals with their price." },
  { icon: Star, title: "Deliver and get reviewed", body: "Finish the work, get paid, and earn reviews that build your reputation." },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" className="border-t border-border">
      <SectionHeading
        eyebrow="How EUREKA works"
        title="Three simple steps"
        description="No middlemen and no complicated process."
      />
      <ol className="mt-14 grid gap-4 sm:grid-cols-3">
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

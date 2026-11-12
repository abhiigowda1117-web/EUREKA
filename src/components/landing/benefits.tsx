import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "./section";

const groups = [
  {
    eyebrow: "For clients",
    title: "Get skilled help without the hunt",
    points: [
      "Post a project in minutes with budget, deadline and skills",
      "Receive proposals and compare price, approach and timeline",
      "Review profiles, portfolios and past ratings before deciding",
      "Track progress and deliverables in one place",
    ],
    cta: { href: "/projects/new", label: "Post a Project" },
  },
  {
    eyebrow: "For freelancers",
    title: "Turn your skills into income and experience",
    points: [
      "Find paid projects that match what you're good at",
      "Set your own price and explain your approach",
      "Build a portfolio and reputation with real reviews",
      "Work around your college timetable",
    ],
    cta: { href: "/signup", label: "Create your profile" },
  },
];

export function Benefits() {
  return (
    <Section id="benefits">
      <div className="grid gap-5 lg:grid-cols-2">
        {groups.map((g, i) => (
          <div
            key={g.eyebrow}
            className={`relative overflow-hidden rounded-2xl border p-7 sm:p-10 card-glow ${
              i === 0 ? "border-border bg-card" : "border-primary/30 bg-gradient-to-br from-primary/[0.14] via-card to-card"
            }`}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">{g.eyebrow}</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{g.title}</h3>
            <ul className="mt-7 space-y-3.5">
              {g.points.map((p) => (
                <li key={p} className="flex gap-3 text-[15px] text-muted-foreground">
                  <Check className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
            <ButtonLink href={g.cta.href} variant={i === 0 ? "secondary" : "primary"} className="mt-8">
              {g.cta.label}
            </ButtonLink>
          </div>
        ))}
      </div>
    </Section>
  );
}

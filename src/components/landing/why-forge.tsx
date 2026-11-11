import { GraduationCap, IndianRupee, Lock, MessagesSquare, ShieldCheck, Users } from "lucide-react";
import { Section, SectionHeading } from "./section";

const reasons = [
  { icon: GraduationCap, title: "Student-first", body: "Designed around college schedules, campus skills and first portfolios — not enterprise procurement." },
  { icon: IndianRupee, title: "Transparent ₹ pricing", body: "Every project shows its budget range up front in Indian Rupees. Proposals state their exact price." },
  { icon: Users, title: "One account, two roles", body: "Hire help for one project and take on freelance work for another — without juggling accounts." },
  { icon: ShieldCheck, title: "Trust signals that mean something", body: "Verified emails, profile completeness and genuine reviews. We never hand out badges we haven't checked." },
  { icon: MessagesSquare, title: "Private project messaging", body: "Only the client and the selected freelancer can read a project's conversation." },
  { icon: Lock, title: "Academic integrity built in", body: "Tutoring, guidance and real projects are welcome. Exam cheating and ghostwriting graded work are not." },
];

export function WhyForge() {
  return (
    <Section id="why" className="border-t border-border bg-surface">
      <SectionHeading
        eyebrow="Why choose FORGE"
        title="A marketplace you can actually trust"
        description="Strangers working together need clarity and safety. That's what we build first."
      />
      <ul className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {reasons.map((r) => (
          <li key={r.title} className="flex gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
              <r.icon className="size-5" aria-hidden />
            </span>
            <div>
              <h3 className="font-semibold">{r.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

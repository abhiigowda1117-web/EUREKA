import { Award, Briefcase, GraduationCap, Wallet } from "lucide-react";
import { Section } from "./section";

const outcomes = [
  { icon: Briefcase, title: "Real work experience", body: "Paid projects for real people, not just college assignments." },
  { icon: Award, title: "A portfolio that proves it", body: "Every finished project and review stays on your profile." },
  { icon: GraduationCap, title: "Internship-ready", body: "Show recruiters work you've actually delivered to a client." },
  { icon: Wallet, title: "Earn while you study", body: "Work around your timetable and get paid for your skills." },
];

/** Why EUREKA exists — the problem it solves for students. */
export function Mission() {
  return (
    <Section id="why" className="border-t border-border bg-surface">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Why EUREKA matters</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Internships ask for experience. Students need a first chance to get it.
          </h2>
          <p className="mt-5 text-muted-foreground sm:text-lg">
            Many students have real skills in code, design or content but no way to prove them. Meanwhile, busy people
            (interns, founders, small businesses) need help with work they don&apos;t have time for.
          </p>
          <p className="mt-4 text-muted-foreground sm:text-lg">
            EUREKA connects the two. Students get real projects, real experience and real income. People with work get it
            done by talented students.
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {outcomes.map((o) => (
            <li key={o.title} className="rounded-xl border border-border bg-card p-5 card-glow">
              <o.icon className="size-6 text-primary" aria-hidden />
              <h3 className="mt-4 font-semibold">{o.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{o.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

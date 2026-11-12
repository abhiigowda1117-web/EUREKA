import { Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Section, SectionHeading } from "./section";

// DEMO CONTENT. These are illustrative scenarios, not real users. Replace them
// with genuine, consented testimonials before launch (see docs/ROADMAP.md).
const examples = [
  { quote: "I was swamped during my internship and needed a site for my side business. I had three solid proposals within a day.", role: "Client · Software engineering intern" },
  { quote: "My first paid project paid for a semester of books, and now it's the strongest thing in my portfolio.", role: "Freelancer · 3rd-year CSE student" },
  { quote: "Comparing proposals side by side — price, timeline, approach — made choosing the right designer easy.", role: "Client · Early-stage founder" },
];

export function Testimonials() {
  return (
    <Section id="stories">
      <SectionHeading eyebrow="Stories" title="What FORGE is built to make possible" />
      <div className="mt-6 flex justify-center">
        <Badge variant="warning">Illustrative examples — not real users yet</Badge>
      </div>
      <ul className="mt-12 grid gap-4 md:grid-cols-3">
        {examples.map((t) => (
          <li key={t.role}>
            <figure className="flex h-full flex-col rounded-xl border border-border bg-card p-6 card-glow">
              <Quote className="size-6 text-primary/60" aria-hidden />
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed">“{t.quote}”</blockquote>
              <figcaption className="mt-6 text-sm text-muted-foreground">{t.role}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}

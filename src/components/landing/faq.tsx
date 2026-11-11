import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { Section, SectionHeading } from "./section";

const faqs = [
  { q: "Is FORGE free to use?", a: "Yes. Creating an account, posting projects and sending proposals is free during our early launch. If we introduce fees later, we'll announce them clearly before they apply." },
  { q: "How do payments work?", a: "Right now FORGE does not process or hold any money. Clients and freelancers agree on a price inside FORGE and settle payment directly between themselves; both sides can record the payment status on the project. Secure in-platform payments are on our roadmap." },
  { q: "Can I be both a client and a freelancer?", a: "Absolutely. One account lets you post projects and take on work. Your dashboard shows both sides." },
  { q: "What kind of work is not allowed?", a: <>Anything that breaks academic integrity — writing someone&apos;s graded assignments, taking exams, plagiarism or impersonation — plus anything illegal or harmful. Tutoring, guidance and genuine projects are welcome. Read our <Link className="text-primary underline-offset-4 hover:underline" href="/guidelines">community guidelines</Link>.</> },
  { q: "How do I know who I'm working with?", a: "Every account has a verified email address. Profiles show completeness, skills, portfolio and reviews from real completed projects. FORGE only shows an identity-verified badge after we've actually checked it." },
  { q: "What if something goes wrong?", a: "You can report any user or project. Our team reviews reports and can remove listings or suspend accounts that break the rules." },
];

export function Faq() {
  return (
    <Section id="faq" className="border-t border-border bg-surface">
      <SectionHeading eyebrow="FAQ" title="Questions, answered" />
      <div className="mx-auto mt-12 max-w-3xl divide-y divide-border rounded-xl border border-border bg-card">
        {faqs.map((f) => (
          <details key={f.q} className="group p-5 sm:px-6 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded font-medium">
              {f.q}
              <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

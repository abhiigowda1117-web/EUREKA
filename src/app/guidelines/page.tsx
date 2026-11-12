import type { Metadata } from "next";
import { ProsePage } from "@/components/site/prose-page";

export const metadata: Metadata = { title: "Community guidelines", description: "How we keep FORGE safe, honest and fair — including our academic integrity policy." };

export default function GuidelinesPage() {
  return (
    <ProsePage title="Community guidelines" updated="11 November 2026">
      <section>
        <p>FORGE works because people who have never met trust each other enough to collaborate. These guidelines protect that trust. Breaking them can lead to listings being removed or accounts being suspended.</p>
      </section>
      <section>
        <h2 id="academic-integrity">Academic integrity</h2>
        <p><strong>Welcome:</strong></p>
        <ul>
          <li>Tutoring, mentoring and explaining concepts</li>
          <li>Debugging help, code reviews and technical guidance</li>
          <li>Real projects for real use — websites, apps, designs, research for a business</li>
          <li>Formatting, proofreading and documentation support for your own work</li>
        </ul>
        <p className="mt-4"><strong>Not allowed:</strong></p>
        <ul>
          <li>Completing someone&apos;s graded assignments, lab records, theses or projects for them to submit as their own</li>
          <li>Taking exams, quizzes or tests on someone&apos;s behalf, or providing answers during them</li>
          <li>Plagiarism, or helping someone disguise copied work</li>
          <li>Impersonating another person in any academic or professional setting</li>
        </ul>
      </section>
      <section>
        <h2>Be honest</h2>
        <ul>
          <li>Describe projects accurately, with a realistic budget and deadline.</li>
          <li>Only list skills you can actually deliver, and only show portfolio work you did.</li>
          <li>Never fake reviews, identities or credentials.</li>
        </ul>
      </section>
      <section>
        <h2>Be respectful and safe</h2>
        <ul>
          <li>No harassment, hate, threats or sexual content.</li>
          <li>Don&apos;t ask for passwords, OTPs or banking credentials.</li>
          <li>Be cautious of anyone asking you to pay upfront to &ldquo;unlock&rdquo; work — that&apos;s a common scam. Report it.</li>
        </ul>
      </section>
      <section>
        <h2>Payments</h2>
        <p>FORGE does not currently process, hold or guarantee payments. Agree on the price, milestones and payment method clearly before starting work, and record the payment status on the project.</p>
      </section>
      <section>
        <h2>Reporting</h2>
        <p>If someone breaks these rules, report the user or project. Our team reviews every report.</p>
      </section>
    </ProsePage>
  );
}

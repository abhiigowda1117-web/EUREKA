import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/site/prose-page";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <ProsePage title="Terms of service" updated="11 November 2026" draft>
      <section>
        <h2>1. What FORGE is</h2>
        <p>FORGE is an online marketplace that helps clients find freelancers and freelancers find projects. FORGE is not a party to the agreements made between clients and freelancers, and is not their employer.</p>
      </section>
      <section>
        <h2>2. Your account</h2>
        <ul>
          <li>You must provide accurate information and keep your password secure.</li>
          <li>You are responsible for activity on your account.</li>
          <li>One person, one account. Accounts may not be sold or transferred.</li>
        </ul>
      </section>
      <section>
        <h2>3. Acceptable use</h2>
        <p>You agree to follow our <Link href="/guidelines" className="text-primary hover:underline">Community Guidelines</Link>, including the academic integrity policy. We may remove content or suspend accounts that violate them.</p>
      </section>
      <section>
        <h2>4. Payments</h2>
        <p>During early access, FORGE does not process, hold or guarantee any payment. Clients and freelancers arrange payment directly and do so at their own risk. Payment status shown on FORGE is recorded by the users themselves.</p>
      </section>
      <section>
        <h2>5. Content</h2>
        <p>You keep ownership of the content you post. You give FORGE permission to display it on the platform. Ownership of work delivered for a project is agreed between the client and the freelancer.</p>
      </section>
      <section>
        <h2>6. Liability</h2>
        <p>FORGE is provided &ldquo;as is&rdquo;. To the extent permitted by law, FORGE is not liable for disputes, losses or damages arising from agreements between users.</p>
      </section>
      <section>
        <h2>7. Changes</h2>
        <p>We may update these terms. We&apos;ll notify users of material changes before they take effect.</p>
      </section>
    </ProsePage>
  );
}

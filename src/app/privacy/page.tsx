import type { Metadata } from "next";
import { ProsePage } from "@/components/site/prose-page";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <ProsePage title="Privacy policy" updated="11 November 2026" draft>
      <section>
        <h2>What we collect</h2>
        <ul>
          <li><strong>Account data:</strong> your email address and a securely hashed password (managed by our authentication provider, Supabase).</li>
          <li><strong>Profile data you choose to add:</strong> name, username, photo, headline, bio, skills, education, experience, portfolio, college and city.</li>
          <li><strong>Marketplace activity:</strong> projects, proposals, messages and reviews you create.</li>
        </ul>
      </section>
      <section>
        <h2>What is public</h2>
        <p>Your profile (except your email address) and the projects you post are visible to anyone. Proposals are visible only to you and the project&apos;s client. Messages are visible only to the participants of that conversation.</p>
      </section>
      <section>
        <h2>How we use it</h2>
        <p>To run the marketplace, keep it safe (for example, reviewing reports), and send essential emails such as verification and password resets. We do not sell personal data.</p>
      </section>
      <section>
        <h2>Where it is stored</h2>
        <p>Data is stored with Supabase (database, authentication, file storage) and the site is served by Vercel.</p>
      </section>
      <section>
        <h2>Your choices</h2>
        <p>You can edit your profile at any time. To delete your account and associated data, contact the FORGE team.</p>
      </section>
    </ProsePage>
  );
}

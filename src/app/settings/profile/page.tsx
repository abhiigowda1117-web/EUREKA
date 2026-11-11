import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  AvatarForm, BasicsForm, EducationSection, ExperienceSection, PortfolioSection, SkillsForm,
} from "@/components/profile/settings-forms";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { requireProfile } from "@/lib/auth";
import { profileCompletion } from "@/lib/profile";
import { getProfileDetails, getSkillGroups } from "@/lib/queries/profiles";

export const metadata: Metadata = { title: "Edit profile" };

function Panel({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 rounded-xl border border-border bg-card p-5 sm:p-7 card-glow">
      <h2 id={`${id}-title`} className="text-lg font-semibold">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default async function EditProfilePage({ searchParams }: PageProps<"/settings/profile">) {
  const { profile } = await requireProfile("/settings/profile");
  const [details, groups, params] = await Promise.all([getProfileDetails(profile.id), getSkillGroups(), searchParams]);
  const completion = profileCompletion(profile, {
    skills: details.skills.length, portfolio: details.portfolio.length,
    education: details.education.length, experience: details.experience.length,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      {params.welcome === "1" && (
        <Alert variant="success" title="You're in! Step 2 of 2: complete your profile." className="mb-6">
          Profiles with a photo, skills and a portfolio get far more trust from clients. Everything here is optional — you can come back anytime.
        </Alert>
      )}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Edit profile</h1>
          <p className="mt-1 text-muted-foreground">Profile {completion.percent}% complete</p>
        </div>
        <ButtonLink href={`/u/${profile.username}`} variant="secondary" size="sm">
          View public profile <ExternalLink aria-hidden />
        </ButtonLink>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]" role="progressbar" aria-valuenow={completion.percent} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completion">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${completion.percent}%` }} />
      </div>

      <div className="mt-8 space-y-6">
        <Panel id="photo" title="Profile photo"><AvatarForm profile={profile} /></Panel>
        <Panel id="basics" title="Basics" description="This is what clients and freelancers see first."><BasicsForm profile={profile} /></Panel>
        <Panel id="skills" title="Skills" description="Pick the skills you'd be confident delivering paid work in.">
          <SkillsForm groups={groups} selected={details.skills.map((s) => s.id)} />
        </Panel>
        <Panel id="portfolio" title="Portfolio" description="Show real work: live sites, GitHub repos, design files."><PortfolioSection items={details.portfolio} /></Panel>
        <Panel id="experience" title="Experience" description="Internships, freelance work, college clubs, open source."><ExperienceSection items={details.experience} /></Panel>
        <Panel id="education" title="Education"><EducationSection items={details.education} /></Panel>
      </div>
    </div>
  );
}

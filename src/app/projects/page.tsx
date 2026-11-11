import { Briefcase } from "lucide-react";
import type { Metadata } from "next";
import { ProjectCard } from "@/components/projects/project-card";
import { SetupNotice } from "@/components/site/setup-notice";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { isSupabaseConfigured } from "@/lib/env";
import { getOpenProjects } from "@/lib/queries/public";

export const metadata: Metadata = {
  title: "Explore projects",
  description: "Browse open freelance projects posted on FORGE — budgets in ₹.",
};

export default async function ProjectsPage() {
  const projects = await getOpenProjects(24);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Explore projects</h1>
          <p className="mt-1 text-muted-foreground">Open opportunities from the FORGE community, newest first.</p>
        </div>
        <ButtonLink href="/projects/new">Post a Project</ButtonLink>
      </div>
      {!isSupabaseConfigured && <SetupNotice className="mt-6" />}
      <Alert variant="info" title="Search, filters and pagination arrive in Milestone 2." className="mt-6" />
      <div className="mt-8">
        {projects.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => <li key={p.id}><ProjectCard project={p} /></li>)}
          </ul>
        ) : (
          <EmptyState icon={Briefcase} title="No open projects yet" description="Be the first to post a project on FORGE." action={<ButtonLink href="/projects/new">Post a Project</ButtonLink>} />
        )}
      </div>
    </div>
  );
}

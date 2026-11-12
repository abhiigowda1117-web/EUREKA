import { ArrowRight, Briefcase } from "lucide-react";
import { ProjectCard } from "@/components/projects/project-card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { ProjectCard as ProjectCardData } from "@/lib/types";
import { Section, SectionHeading } from "./section";

export function FeaturedProjects({ projects }: { projects: ProjectCardData[] }) {
  return (
    <Section id="opportunities">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading
          align="left"
          eyebrow="Latest opportunities"
          title="Real projects, posted by real people"
          description="These are the newest open projects on FORGE, straight from the marketplace."
        />
        {projects.length > 0 && (
          <ButtonLink href="/projects" variant="secondary">
            View all projects <ArrowRight aria-hidden />
          </ButtonLink>
        )}
      </div>
      <div className="mt-12">
        {projects.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <li key={p.id}><ProjectCard project={p} /></li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Briefcase}
            title="No open projects yet"
            description="FORGE is just getting started. Post the first project and get proposals from skilled students."
            action={<ButtonLink href="/projects/new">Post a Project</ButtonLink>}
          />
        )}
      </div>
    </Section>
  );
}

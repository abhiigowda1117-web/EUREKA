import { CalendarClock, MessageSquareText } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ProjectCard as ProjectCardData } from "@/lib/types";
import { formatBudget, timeAgo } from "@/lib/utils";

const statusLabel: Record<string, { label: string; variant: "success" | "primary" | "default" }> = {
  open: { label: "Open", variant: "success" },
  in_progress: { label: "In progress", variant: "primary" },
  completed: { label: "Completed", variant: "default" },
};

export function ProjectCard({ project }: { project: ProjectCardData }) {
  const status = statusLabel[project.status] ?? { label: project.status, variant: "default" as const };
  const skills = project.skills.map((s) => s.skill?.name).filter(Boolean) as string[];
  const deadline = new Date(project.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card-hover card-glow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {project.category && <p className="text-xs font-medium text-primary">{project.category.name}</p>}
          <h3 className="mt-1 line-clamp-2 font-semibold leading-snug">
            {/* The stretched link makes the whole card clickable while staying a single tab stop. */}
            <Link href={`/projects/${project.id}`} className="after:absolute after:inset-0 after:rounded-xl">
              {project.title}
            </Link>
          </h3>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
      {skills.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Required skills">
          {skills.slice(0, 4).map((s) => (
            <li key={s}><Badge>{s}</Badge></li>
          ))}
          {skills.length > 4 && <li><Badge>+{skills.length - 4}</Badge></li>}
        </ul>
      )}
      <div className="mt-auto pt-5">
        <p className="text-lg font-semibold tracking-tight">
          {formatBudget(project.budget_min, project.budget_max)}
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
            {project.budget_type === "fixed" ? "fixed" : "negotiable"}
          </span>
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><CalendarClock className="size-3.5" aria-hidden /> Due {deadline}</span>
          <span className="inline-flex items-center gap-1"><MessageSquareText className="size-3.5" aria-hidden /> {project.proposal_count} proposals</span>
          <span>Posted {timeAgo(project.created_at)}</span>
        </div>
        {project.client && (
          <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-sm">
            <Avatar src={project.client.avatar_url} name={project.client.full_name} size={24} />
            <span className="truncate text-muted-foreground">{project.client.full_name}</span>
          </div>
        )}
      </div>
    </article>
  );
}

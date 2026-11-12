import { ArrowRight, Briefcase, CheckCircle2, Circle, FileText, MessagesSquare, Search, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ProjectCard } from "@/components/projects/project-card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireProfile } from "@/lib/auth";
import { profileCompletion } from "@/lib/profile";
import { getProfileDetails } from "@/lib/queries/profiles";
import { PROJECT_CARD_SELECT } from "@/lib/queries/public";
import { createClient } from "@/lib/supabase/server";
import type { ProjectCard as ProjectCardData } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard" };

// Features that exist in the database design but ship in later milestones.
// Shown honestly as "coming", never as fake numbers.
const upcoming = [
  { icon: FileText, title: "Post & manage projects", milestone: 2 },
  { icon: Search, title: "Browse with search & filters", milestone: 2 },
  { icon: Briefcase, title: "Proposals & hiring", milestone: 3 },
  { icon: MessagesSquare, title: "Messaging & deliverables", milestone: 4 },
  { icon: Star, title: "Reviews & reputation", milestone: 5 },
];

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const { profile } = await requireProfile("/dashboard");
  const supabase = await createClient();
  const [details, myProjects, params] = await Promise.all([
    getProfileDetails(profile.id),
    supabase.from("projects").select(PROJECT_CARD_SELECT).eq("client_id", profile.id).order("created_at", { ascending: false }).limit(6),
    searchParams,
  ]);
  if (myProjects.error) throw new Error(myProjects.error.message);
  const projects = myProjects.data as unknown as ProjectCardData[];
  const completion = profileCompletion(profile, {
    skills: details.skills.length, portfolio: details.portfolio.length,
    education: details.education.length, experience: details.experience.length,
  });
  const firstName = profile.full_name.split(" ")[0] || profile.username;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      {params.password === "updated" && <Alert variant="success" title="Your password has been updated." className="mb-6" />}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Hi, {firstName}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.is_client && <Badge variant="primary">Client</Badge>}
            {profile.is_freelancer && <Badge variant="primary">Freelancer</Badge>}
          </div>
        </div>
        <ButtonLink href="/projects">Explore projects <ArrowRight aria-hidden /></ButtonLink>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {profile.is_client && (
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Your posted projects</CardTitle>
                  <CardDescription>Projects you&apos;ve posted as a client.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {projects.length > 0 ? (
                  <ul className="grid gap-4 md:grid-cols-2">
                    {projects.map((p) => <li key={p.id}><ProjectCard project={p} /></li>)}
                  </ul>
                ) : (
                  <EmptyState icon={FileText} title="No projects yet" description="Project posting opens in the next milestone. You'll manage proposals right here." />
                )}
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Coming to FORGE</CardTitle>
              <CardDescription>We&apos;re building in milestones. Here&apos;s what&apos;s next on your dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 sm:grid-cols-2">
                {upcoming.map((u) => (
                  <li key={u.title} className="flex items-center gap-3 rounded-lg border border-border bg-white/[0.02] p-3.5">
                    <u.icon className="size-5 shrink-0 text-primary" aria-hidden />
                    <span className="flex-1 text-sm">{u.title}</span>
                    <Badge>M{u.milestone}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile strength</CardTitle>
              <CardDescription>{completion.percent}% complete</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]" role="progressbar" aria-valuenow={completion.percent} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completion">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${completion.percent}%` }} />
              </div>
              <ul className="mt-5 space-y-2.5">
                {completion.checks.map((c) => (
                  <li key={c.label}>
                    <Link href={c.href} className="flex items-center gap-2.5 text-sm hover:text-foreground">
                      {c.done ? <CheckCircle2 className="size-4 text-success" aria-hidden /> : <Circle className="size-4 text-subtle-foreground" aria-hidden />}
                      <span className={c.done ? "text-muted-foreground line-through" : ""}>{c.label}</span>
                      <span className="sr-only">{c.done ? "(done)" : "(to do)"}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <ButtonLink href="/settings/profile" variant="secondary" size="sm" className="mt-6 w-full">Edit profile</ButtonLink>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

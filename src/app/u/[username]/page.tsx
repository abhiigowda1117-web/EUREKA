import { BadgeCheck, Briefcase, CalendarDays, ExternalLink, GraduationCap, Link2, MailCheck, MapPin, Pencil, Star } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getSessionUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { getProfileByUsername, getProfileDetails } from "@/lib/queries/profiles";

export async function generateMetadata({ params }: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username } = await params;
  if (!isSupabaseConfigured) return { title: "Profile" };
  const profile = await getProfileByUsername(username);
  if (!profile) return { title: "Profile not found" };
  return { title: `${profile.full_name} (@${profile.username})`, description: profile.headline ?? undefined };
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6 card-glow">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function PublicProfilePage({ params }: PageProps<"/u/[username]">) {
  const { username } = await params;
  if (!isSupabaseConfigured) notFound();
  const profile = await getProfileByUsername(username);
  if (!profile || !profile.onboarded_at) notFound();
  const [details, viewer] = await Promise.all([getProfileDetails(profile.id), getSessionUser()]);
  const isOwner = viewer?.id === profile.id;
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : null);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/[0.12] via-card to-card p-6 sm:p-8 card-glow">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar src={profile.avatar_url} name={profile.full_name} size={104} />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{profile.full_name}</h1>
            <p className="text-muted-foreground">@{profile.username}</p>
            {profile.headline && <p className="mt-2 text-lg">{profile.headline}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {/* Email is verified for every account that can log in ("Confirm email" is required). */}
              <Badge variant="success"><MailCheck aria-hidden /> Email verified</Badge>
              {profile.identity_verified_at ? (
                <Badge variant="primary"><BadgeCheck aria-hidden /> Identity verified</Badge>
              ) : (
                <Badge>Identity not verified</Badge>
              )}
              {profile.is_freelancer && <Badge>Freelancer</Badge>}
              {profile.is_client && <Badge>Client</Badge>}
            </div>
          </div>
          {isOwner && (
            <ButtonLink href="/settings/profile" variant="secondary" size="sm" className="self-start">
              <Pencil aria-hidden /> Edit profile
            </ButtonLink>
          )}
        </div>
        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5 text-sm text-muted-foreground">
          {profile.location && <li className="inline-flex items-center gap-1.5"><MapPin className="size-4" aria-hidden />{profile.location}</li>}
          {profile.college && <li className="inline-flex items-center gap-1.5"><GraduationCap className="size-4" aria-hidden />{profile.college}</li>}
          {profile.website_url && (
            <li>
              <a href={profile.website_url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                <Link2 className="size-4" aria-hidden />{profile.website_url.replace(/^https?:\/\//, "")}
              </a>
            </li>
          )}
          <li className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" aria-hidden />Member since {memberSince}</li>
        </ul>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Block title="About">
            {profile.bio ? <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{profile.bio}</p> : <p className="text-sm text-subtle-foreground">No bio yet.</p>}
          </Block>
          <Block title="Portfolio">
            {details.portfolio.length > 0 ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {details.portfolio.map((p) => (
                  <li key={p.id} className="rounded-lg border border-border bg-white/[0.02] p-4">
                    <p className="font-medium">{p.title}</p>
                    {p.description && <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{p.description}</p>}
                    {p.project_url && (
                      <a href={p.project_url} target="_blank" rel="noopener noreferrer nofollow" className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                        View project <ExternalLink className="size-3" aria-hidden />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-subtle-foreground">No portfolio projects yet.</p>}
          </Block>
          <Block title="Experience">
            {details.experience.length > 0 ? (
              <ul className="space-y-4">
                {details.experience.map((e) => (
                  <li key={e.id} className="flex gap-3">
                    <Briefcase className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <div>
                      <p className="font-medium">{e.title}{e.organization && <span className="font-normal text-muted-foreground"> · {e.organization}</span>}</p>
                      {e.start_date && <p className="text-sm text-subtle-foreground">{fmt(e.start_date)} – {fmt(e.end_date) ?? "Present"}</p>}
                      {e.description && <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-subtle-foreground">No experience added yet.</p>}
          </Block>
          <Block title="Reviews">
            <EmptyState icon={Star} title="No reviews yet" description="Reviews appear here after completed FORGE projects. They can't be added any other way." className="py-8" />
          </Block>
        </div>
        <aside className="space-y-6">
          <Block title="Skills">
            {details.skills.length > 0 ? (
              <ul className="flex flex-wrap gap-2">{details.skills.map((s) => <li key={s.id}><Badge>{s.name}</Badge></li>)}</ul>
            ) : <p className="text-sm text-subtle-foreground">No skills listed yet.</p>}
          </Block>
          <Block title="Education">
            {details.education.length > 0 ? (
              <ul className="space-y-3">
                {details.education.map((e) => (
                  <li key={e.id}>
                    <p className="font-medium">{e.institution}</p>
                    <p className="text-sm text-muted-foreground">{[e.degree, e.field].filter(Boolean).join(", ")}</p>
                    {e.start_year && <p className="text-xs text-subtle-foreground">{e.start_year} – {e.end_year ?? "Present"}</p>}
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-subtle-foreground">No education added yet.</p>}
          </Block>
        </aside>
      </div>
    </div>
  );
}

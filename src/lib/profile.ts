import type { Profile } from "@/lib/types";

/**
 * Profile completeness score shown on dashboards and profiles.
 * Each item is something a client actually looks at before hiring.
 */
export function profileCompletion(
  profile: Profile,
  counts: { skills: number; portfolio: number; education: number; experience: number },
) {
  const checks = [
    { label: "Add a profile picture", done: Boolean(profile.avatar_url), href: "/settings/profile#photo" },
    { label: "Write a professional headline", done: Boolean(profile.headline), href: "/settings/profile#basics" },
    { label: "Write an about section", done: (profile.bio?.length ?? 0) >= 50, href: "/settings/profile#basics" },
    { label: "Add at least 3 skills", done: counts.skills >= 3, href: "/settings/profile#skills" },
    { label: "Add your education", done: counts.education > 0, href: "/settings/profile#education" },
    { label: "Add experience", done: counts.experience > 0, href: "/settings/profile#experience" },
    { label: "Add a portfolio project", done: counts.portfolio > 0, href: "/settings/profile#portfolio" },
  ];
  const done = checks.filter((c) => c.done).length;
  return { percent: Math.round((done / checks.length) * 100), checks };
}

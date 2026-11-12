import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Category, Education, Experience, PortfolioItem, Profile, Skill } from "@/lib/types";

export type ProfileDetails = {
  skills: Pick<Skill, "id" | "name">[];
  education: Education[];
  experience: Experience[];
  portfolio: PortfolioItem[];
};

export async function getProfileDetails(profileId: string): Promise<ProfileDetails> {
  const supabase = await createClient();
  const [skills, education, experience, portfolio] = await Promise.all([
    supabase.from("profile_skills").select("skill:skills(id, name)").eq("profile_id", profileId),
    supabase.from("profile_education").select("id, institution, degree, field, start_year, end_year").eq("profile_id", profileId).order("start_year", { ascending: false, nullsFirst: false }),
    supabase.from("profile_experience").select("id, title, organization, description, start_date, end_date").eq("profile_id", profileId).order("start_date", { ascending: false, nullsFirst: false }),
    supabase.from("portfolio_items").select("id, title, description, project_url, image_path").eq("profile_id", profileId).order("created_at", { ascending: false }),
  ]);
  const failed = [skills, education, experience, portfolio].find((r) => r.error);
  if (failed?.error) throw new Error(`Could not load profile details: ${failed.error.message}`);
  return {
    skills: (skills.data as unknown as { skill: Pick<Skill, "id" | "name"> | null }[])
      .map((r) => r.skill)
      .filter((s): s is Pick<Skill, "id" | "name"> => Boolean(s))
      .sort((a, b) => a.name.localeCompare(b.name)),
    education: education.data as Education[],
    experience: experience.data as Experience[],
    portfolio: portfolio.data as PortfolioItem[],
  };
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("username", username.toLowerCase()).maybeSingle();
  return (data as Profile | null) ?? null;
}

export type SkillGroup = { category: Pick<Category, "id" | "name">; skills: Pick<Skill, "id" | "name">[] };

/** All active skills grouped under their category, for the skills picker. */
export async function getSkillGroups(): Promise<SkillGroup[]> {
  const supabase = await createClient();
  const [cats, skills] = await Promise.all([
    supabase.from("categories").select("id, name").order("sort_order"),
    supabase.from("skills").select("id, name, category_id").order("name"),
  ]);
  if (cats.error || skills.error) throw new Error("Could not load skills");
  const groups: SkillGroup[] = cats.data.map((c) => ({ category: c, skills: [] }));
  const other: SkillGroup = { category: { id: 0, name: "Other" }, skills: [] };
  for (const s of skills.data) {
    (groups.find((g) => g.category.id === s.category_id) ?? other).skills.push({ id: s.id, name: s.name });
  }
  return [...groups, other].filter((g) => g.skills.length > 0);
}

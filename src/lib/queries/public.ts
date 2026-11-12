import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Category, ProjectCard } from "@/lib/types";

/** Columns needed to render a project card (joins category, client and skills). */
export const PROJECT_CARD_SELECT = `
  id, title, description, budget_type, budget_min, budget_max, deadline, status, proposal_count, created_at,
  category:categories(name, slug),
  client:profiles!projects_client_id_fkey(full_name, username, avatar_url, identity_verified_at),
  skills:project_skills(skill:skills(name))
`;

/**
 * The landing page and marketplace should still render if Supabase is
 * unreachable (wrong URL, network down). We log the real error for developers
 * and show an empty state to visitors instead of crashing the page.
 */
function logUnreachable(what: string, message: string) {
  console.error(`[FORGE] Could not load ${what}: ${message}. Check NEXT_PUBLIC_SUPABASE_URL / key in .env.local.`);
}

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, description, icon")
    .order("sort_order");
  if (error) {
    logUnreachable("categories", error.message);
    return [];
  }
  return data;
}

export async function getOpenProjects(limit = 6): Promise<ProjectCard[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_CARD_SELECT)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    logUnreachable("projects", error.message);
    return [];
  }
  return data as unknown as ProjectCard[];
}

/** Real numbers straight from the database — never invented. */
export async function getPlatformStats() {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const [members, open, completed] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).not("onboarded_at", "is", null),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "completed"),
  ]);
  if (members.error || open.error || completed.error) return null;
  return { members: members.count ?? 0, openProjects: open.count ?? 0, completedProjects: completed.count ?? 0 };
}

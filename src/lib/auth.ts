import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * DATA ACCESS LAYER for "who is logged in?".
 * Every page and Server Action asks these functions — never trust anything
 * the browser sends about identity. `cache()` dedupes calls within one request.
 */
// NOTE: Supabase's "Confirm email" setting must be ON. Then nobody can obtain a
// session before verifying their email, so every SessionUser is email-verified.
export type SessionUser = { id: string; email: string };

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  // getClaims() verifies the JWT signature — unlike getSession(), it can't be spoofed by a tampered cookie.
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return { id: data.claims.sub, email: data.claims.email ?? "" };
});

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const user = await getSessionUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return (data as Profile | null) ?? null;
});

/** Use at the top of private pages. Redirects to /login if not signed in. */
export async function requireUser(nextPath = "/dashboard") {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

/** Signed in AND finished onboarding (has a username). Otherwise sends them to finish it. */
export async function requireProfile(nextPath = "/dashboard") {
  const user = await requireUser(nextPath);
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (profile.status === "suspended") redirect("/suspended");
  if (!profile.username || !profile.onboarded_at) redirect("/onboarding");
  return { user, profile };
}

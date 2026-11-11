"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { formFields, validationError } from "@/lib/validation/form";
import {
  AVATAR_MAX_BYTES, AVATAR_TYPES, educationSchema, experienceSchema, portfolioSchema, profileBasicsSchema, skillsSchema,
} from "@/lib/validation/profile";

/**
 * Every action re-checks who is logged in (requireProfile) and validates input
 * on the server. The browser can be tampered with; the server can't.
 */
async function done(username: string | null, message: string): Promise<ActionState> {
  revalidatePath("/settings/profile");
  revalidatePath("/dashboard");
  if (username) revalidatePath(`/u/${username}`);
  return { ok: true, message };
}

const SAVE_FAILED: ActionState = { error: "Something went wrong while saving. Please try again." };

export async function updateBasics(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireProfile("/settings/profile");
  const fields = formFields(formData, ["fullName", "headline", "bio", "location", "college", "websiteUrl"]);
  const parsed = profileBasicsSchema.safeParse({
    ...fields,
    isClient: formData.get("isClient") === "on",
    isFreelancer: formData.get("isFreelancer") === "on",
  });
  if (!parsed.success) return validationError(parsed.error, fields);
  const v = parsed.data;
  if (!v.isClient && !v.isFreelancer) {
    return { error: "Please fix the highlighted fields.", fieldErrors: { roles: ["Choose at least one way to use FORGE"] }, values: fields };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: v.fullName, headline: v.headline, bio: v.bio, location: v.location, college: v.college,
      website_url: v.websiteUrl, is_client: v.isClient, is_freelancer: v.isFreelancer,
    })
    .eq("id", profile.id);
  if (error) return { ...SAVE_FAILED, values: fields };
  return done(profile.username, "Profile saved.");
}

export async function updateSkills(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireProfile("/settings/profile");
  const parsed = skillsSchema.safeParse(formData.getAll("skills"));
  if (!parsed.success) return validationError(parsed.error);
  const wanted = [...new Set(parsed.data)];

  const supabase = await createClient();
  const { data: current, error: readError } = await supabase.from("profile_skills").select("skill_id").eq("profile_id", profile.id);
  if (readError) return SAVE_FAILED;
  const have = new Set(current.map((r) => r.skill_id as number));
  const toAdd = wanted.filter((id) => !have.has(id));
  const toRemove = [...have].filter((id) => !wanted.includes(id));

  if (toRemove.length) {
    const { error } = await supabase.from("profile_skills").delete().eq("profile_id", profile.id).in("skill_id", toRemove);
    if (error) return SAVE_FAILED;
  }
  if (toAdd.length) {
    const { error } = await supabase.from("profile_skills").insert(toAdd.map((skill_id) => ({ profile_id: profile.id, skill_id })));
    if (error) return SAVE_FAILED;
  }
  return done(profile.username, "Skills saved.");
}

export async function uploadAvatar(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireProfile("/settings/profile");
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an image to upload." };
  if (!AVATAR_TYPES.includes(file.type as (typeof AVATAR_TYPES)[number])) return { error: "Use a JPG, PNG or WebP image." };
  if (file.size > AVATAR_MAX_BYTES) return { error: "That image is larger than 2 MB." };

  const supabase = await createClient();
  const ext = file.type.split("/")[1]!.replace("jpeg", "jpg");
  // Path starts with the user's id — storage policies only allow writing inside your own folder.
  const path = `${profile.id}/avatar-${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
  });
  if (uploadError) return { error: "Upload failed. Please try a different image." };

  const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
  const { error } = await supabase.from("profiles").update({ avatar_url: pub.publicUrl }).eq("id", profile.id);
  if (error) return SAVE_FAILED;

  // Clean up the previous avatar file so storage doesn't fill with old photos.
  const previous = profile.avatar_url?.split("/avatars/")[1];
  if (previous?.startsWith(`${profile.id}/`)) await supabase.storage.from("avatars").remove([previous]);
  return done(profile.username, "Profile photo updated.");
}

export async function removeAvatar(): Promise<ActionState> {
  const { profile } = await requireProfile("/settings/profile");
  const supabase = await createClient();
  const previous = profile.avatar_url?.split("/avatars/")[1];
  const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", profile.id);
  if (error) return SAVE_FAILED;
  if (previous?.startsWith(`${profile.id}/`)) await supabase.storage.from("avatars").remove([previous]);
  return done(profile.username, "Profile photo removed.");
}

export async function addEducation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireProfile("/settings/profile");
  const fields = formFields(formData, ["institution", "degree", "field", "startYear", "endYear"]);
  const parsed = educationSchema.safeParse(fields);
  if (!parsed.success) return validationError(parsed.error, fields);
  const v = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("profile_education").insert({
    profile_id: profile.id, institution: v.institution, degree: v.degree, field: v.field, start_year: v.startYear, end_year: v.endYear,
  });
  if (error) return { ...SAVE_FAILED, values: fields };
  return done(profile.username, "Education added.");
}

export async function addExperience(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireProfile("/settings/profile");
  const fields = formFields(formData, ["title", "organization", "description", "startDate", "endDate"]);
  const parsed = experienceSchema.safeParse(fields);
  if (!parsed.success) return validationError(parsed.error, fields);
  const v = parsed.data;
  // <input type="month"> gives "2025-06"; Postgres date needs a day.
  const toDate = (d: string | null) => (d && d.length === 7 ? `${d}-01` : d);
  const supabase = await createClient();
  const { error } = await supabase.from("profile_experience").insert({
    profile_id: profile.id, title: v.title, organization: v.organization, description: v.description,
    start_date: toDate(v.startDate), end_date: toDate(v.endDate),
  });
  if (error) return { ...SAVE_FAILED, values: fields };
  return done(profile.username, "Experience added.");
}

export async function addPortfolioItem(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireProfile("/settings/profile");
  const fields = formFields(formData, ["title", "description", "projectUrl"]);
  const parsed = portfolioSchema.safeParse(fields);
  if (!parsed.success) return validationError(parsed.error, fields);
  const v = parsed.data;
  const supabase = await createClient();
  const { count } = await supabase.from("portfolio_items").select("id", { count: "exact", head: true }).eq("profile_id", profile.id);
  if ((count ?? 0) >= 12) return { error: "You can show up to 12 portfolio projects.", values: fields };
  const { error } = await supabase.from("portfolio_items").insert({
    profile_id: profile.id, title: v.title, description: v.description, project_url: v.projectUrl,
  });
  if (error) return { ...SAVE_FAILED, values: fields };
  return done(profile.username, "Portfolio project added.");
}

const DELETABLE = { education: "profile_education", experience: "profile_experience", portfolio: "portfolio_items" } as const;

export async function deleteProfileItem(kind: keyof typeof DELETABLE, id: string): Promise<ActionState> {
  const { profile } = await requireProfile("/settings/profile");
  if (!(kind in DELETABLE) || !/^[0-9a-f-]{36}$/i.test(id)) return { error: "Invalid request." };
  const supabase = await createClient();
  const { error } = await supabase.from(DELETABLE[kind]).delete().eq("id", id).eq("profile_id", profile.id);
  if (error) return SAVE_FAILED;
  return done(profile.username, "Removed.");
}

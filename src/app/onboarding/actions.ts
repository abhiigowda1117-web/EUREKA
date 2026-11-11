"use server";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { formFields, validationError } from "@/lib/validation/form";
import { onboardingSchema } from "@/lib/validation/profile";

export async function completeOnboarding(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/onboarding");

  const fields = formFields(formData, ["fullName", "username", "intent", "college"]);
  const parsed = onboardingSchema.safeParse(fields);
  if (!parsed.success) return validationError(parsed.error, fields);
  const { fullName, username, intent, college } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      username,
      college,
      is_client: intent !== "freelancer",
      is_freelancer: intent !== "client",
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", user.id); // RLS also enforces this — defence in depth.

  if (error) {
    if (error.code === "23505") {
      return { error: "Please fix the highlighted fields.", fieldErrors: { username: ["That username is taken. Try another."] }, values: fields };
    }
    return { error: "We couldn't save your profile. Please try again.", values: fields };
  }
  redirect("/settings/profile?welcome=1");
}

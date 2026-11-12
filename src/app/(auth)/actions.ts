"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured, siteUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { safeNextPath } from "@/lib/utils";
import { emailOnlySchema, resetPasswordSchema, signInSchema, signUpSchema } from "@/lib/validation/auth";
import { formFields, validationError } from "@/lib/validation/form";

const NOT_CONFIGURED: ActionState = { error: "Supabase is not connected yet. See the README to finish setup." };

/** Build absolute links for emails from the current request (works on localhost, previews and production). */
async function origin() {
  const h = await headers();
  return h.get("origin") ?? siteUrl;
}

/** Supabase error codes → friendly messages. Never leak raw internals to the user. */
function friendlyAuthError(code: string | undefined, fallback: string) {
  switch (code) {
    case "invalid_credentials":
      return "That email and password don't match. Check them and try again.";
    case "email_not_confirmed":
      return "Please verify your email first — check your inbox for the link we sent.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many attempts. Please wait a minute and try again.";
    case "weak_password":
      return "That password is too weak. Use at least 8 characters with letters and numbers.";
    case "same_password":
      return "Your new password must be different from the old one.";
    default:
      return fallback;
  }
}

export async function signUp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured) return NOT_CONFIGURED;
  const fields = formFields(formData, ["fullName", "email", "password"]);
  const values = { fullName: fields.fullName, email: fields.email }; // never echo passwords back
  const parsed = signUpSchema.safeParse({ ...fields, terms: formData.get("terms") ?? undefined });
  if (!parsed.success) return validationError(parsed.error, values);

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${await origin()}/auth/confirm?next=/onboarding`,
    },
  });
  if (error) return { error: friendlyAuthError(error.code, "We couldn't create your account. Please try again."), values };

  // Supabase deliberately returns success even if the email is already
  // registered (so attackers can't discover who has an account). We do the same.
  redirect(`/verify-email?email=${encodeURIComponent(parsed.data.email)}`);
}

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured) return NOT_CONFIGURED;
  const fields = formFields(formData, ["email", "password"]);
  const values = { email: fields.email };
  const parsed = signInSchema.safeParse(fields);
  if (!parsed.success) return validationError(parsed.error, values);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return {
      error: friendlyAuthError(error.code, "We couldn't log you in. Please try again."),
      fieldErrors: error.code === "email_not_confirmed" ? { unverified: ["true"] } : undefined,
      values,
    };
  }
  redirect(safeNextPath(formData.get("next")));
}

export async function requestPasswordReset(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured) return NOT_CONFIGURED;
  const fields = formFields(formData, ["email"]);
  const parsed = emailOnlySchema.safeParse(fields);
  if (!parsed.success) return validationError(parsed.error, fields);

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await origin()}/auth/confirm?next=/reset-password`,
  });
  if (error?.code?.startsWith("over_")) return { error: friendlyAuthError(error.code, "") };
  // Same message whether or not the account exists (prevents account discovery).
  return { ok: true, message: "If an account exists for that email, a reset link is on its way. It expires in 1 hour." };
}

export async function updatePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured) return NOT_CONFIGURED;
  const parsed = resetPasswordSchema.safeParse(formFields(formData, ["password", "confirmPassword"]));
  if (!parsed.success) return validationError(parsed.error);

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return { error: "Your reset link has expired. Request a new one." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: friendlyAuthError(error.code, "We couldn't update your password. Please try again.") };
  redirect("/dashboard?password=updated");
}

export async function resendVerification(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured) return NOT_CONFIGURED;
  const fields = formFields(formData, ["email"]);
  const parsed = emailOnlySchema.safeParse(fields);
  if (!parsed.success) return validationError(parsed.error, fields);

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: `${await origin()}/auth/confirm?next=/onboarding` },
  });
  if (error?.code?.startsWith("over_")) return { error: friendlyAuthError(error.code, "") };
  return { ok: true, message: "If that address is waiting for verification, we've sent a new link." };
}

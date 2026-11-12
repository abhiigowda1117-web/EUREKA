import type { z } from "zod";
import type { ActionState } from "@/lib/types";

/** Read text fields from FormData as a plain object (missing fields become ""). */
export function formFields<K extends string>(formData: FormData, keys: readonly K[]) {
  return Object.fromEntries(keys.map((k) => [k, String(formData.get(k) ?? "")])) as Record<K, string>;
}

/** Convert a zod error into our ActionState shape for the form to display. */
export function validationError(error: z.ZodError, values?: Record<string, string>): ActionState {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return { error: "Please fix the highlighted fields.", fieldErrors, values };
}

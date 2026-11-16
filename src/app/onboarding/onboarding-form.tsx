"use client";

import { useActionState } from "react";
import { RolePicker } from "@/components/auth/role-picker";
import { Alert } from "@/components/ui/alert";
import { Field, fieldAria } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ActionState } from "@/lib/types";
import { completeOnboarding } from "./actions";

export function OnboardingForm({ defaultName, defaultUsername, defaultIntent }: { defaultName: string; defaultUsername: string; defaultIntent?: string }) {
  const [state, action] = useActionState(completeOnboarding, {} as ActionState);
  const err = (k: string) => state.fieldErrors?.[k]?.[0];
  const selected = state.values?.intent ?? defaultIntent;

  return (
    <form action={action} className="space-y-6" noValidate>
      {state.error && <Alert variant="error" title={state.error} />}
      <RolePicker defaultValue={selected} error={err("intent")} />

      <Field id="fullName" label="Full name" error={err("fullName")}>
        <Input {...fieldAria("fullName", err("fullName"))} autoComplete="name" defaultValue={state.values?.fullName ?? defaultName} required />
      </Field>
      <Field id="username" label="Username" hint="Your public profile link: eureka/u/username. Lowercase letters, numbers and underscores." error={err("username")}>
        <div className="flex">
          <span className="inline-flex items-center rounded-l-lg border border-r-0 border-input bg-white/[0.02] px-3 text-sm text-muted-foreground">@</span>
          <Input {...fieldAria("username", err("username"), true)} className="rounded-l-none" autoCapitalize="none" autoCorrect="off" spellCheck={false} defaultValue={state.values?.username ?? defaultUsername} required />
        </div>
      </Field>
      <Field id="college" label="College or organisation" optional error={err("college")}>
        <Input {...fieldAria("college", err("college"))} autoComplete="organization" placeholder="e.g. RV College of Engineering" defaultValue={state.values?.college} />
      </Field>
      <SubmitButton size="lg" className="w-full" pendingText="Saving…">Continue</SubmitButton>
    </form>
  );
}

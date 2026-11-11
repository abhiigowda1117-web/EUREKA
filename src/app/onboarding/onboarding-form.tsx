"use client";

import { Briefcase, Layers, Rocket } from "lucide-react";
import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Field, fieldAria } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ActionState } from "@/lib/types";
import { cn } from "@/lib/utils";
import { completeOnboarding } from "./actions";

const intents = [
  { value: "client", label: "Hire talent", body: "I want to post projects", icon: Briefcase },
  { value: "freelancer", label: "Find work", body: "I want to earn with my skills", icon: Rocket },
  { value: "both", label: "Both", body: "I'll do a bit of each", icon: Layers },
];

export function OnboardingForm({ defaultName, defaultUsername }: { defaultName: string; defaultUsername: string }) {
  const [state, action] = useActionState(completeOnboarding, {} as ActionState);
  const err = (k: string) => state.fieldErrors?.[k]?.[0];
  const selected = state.values?.intent ?? "both";

  return (
    <form action={action} className="space-y-6" noValidate>
      {state.error && <Alert variant="error" title={state.error} />}
      <fieldset>
        <legend className="text-sm font-medium">How will you use FORGE?</legend>
        <p className="mt-1 text-xs text-muted-foreground">You can change this anytime — one account does both.</p>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
          {intents.map((i) => (
            <label
              key={i.value}
              className={cn(
                "flex cursor-pointer flex-col gap-2 rounded-xl border border-border bg-white/[0.02] p-4 transition-colors hover:border-border-strong",
                "has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
              )}
            >
              <input type="radio" name="intent" value={i.value} defaultChecked={selected === i.value} className="sr-only" />
              <i.icon className="size-5 text-primary" aria-hidden />
              <span className="font-medium">{i.label}</span>
              <span className="text-xs text-muted-foreground">{i.body}</span>
            </label>
          ))}
        </div>
        {err("intent") && <p role="alert" className="mt-2 text-sm text-destructive">{err("intent")}</p>}
      </fieldset>

      <Field id="fullName" label="Full name" error={err("fullName")}>
        <Input {...fieldAria("fullName", err("fullName"))} autoComplete="name" defaultValue={state.values?.fullName ?? defaultName} required />
      </Field>
      <Field id="username" label="Username" hint="Your public profile link: forge/u/username. Lowercase letters, numbers and underscores." error={err("username")}>
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

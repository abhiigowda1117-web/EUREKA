import { Briefcase, Layers, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

const roles = [
  { value: "freelancer", label: "I want to work", body: "Find projects and earn with my skills", icon: Rocket },
  { value: "client", label: "I want to give projects", body: "Post work and hire talented people", icon: Briefcase },
  { value: "both", label: "Both", body: "I'll do a bit of each", icon: Layers },
];

/** The first question every new EUREKA user answers. Plain radio buttons, so it works without JavaScript. */
export function RolePicker({ defaultValue, error }: { defaultValue?: string; error?: string }) {
  return (
    <fieldset aria-describedby={error ? "intent-error" : undefined}>
      <legend className="text-sm font-medium">How will you use EUREKA?</legend>
      <div className="mt-2.5 grid gap-2.5">
        {roles.map((r) => (
          <label
            key={r.value}
            className={cn(
              "flex cursor-pointer items-center gap-3.5 rounded-xl border border-border bg-white/[0.02] p-3.5 transition-colors hover:border-border-strong",
              "has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
            )}
          >
            <input type="radio" name="intent" value={r.value} defaultChecked={defaultValue === r.value} required className="size-4 shrink-0 accent-[var(--primary)]" />
            <r.icon className="size-5 shrink-0 text-primary" aria-hidden />
            <span className="min-w-0">
              <span className="block font-medium">{r.label}</span>
              <span className="block text-xs text-muted-foreground">{r.body}</span>
            </span>
          </label>
        ))}
      </div>
      {error && <p id="intent-error" role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
    </fieldset>
  );
}

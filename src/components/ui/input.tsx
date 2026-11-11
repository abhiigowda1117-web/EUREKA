import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-lg border border-input bg-white/[0.03] px-3.5 text-[15px] text-foreground placeholder:text-subtle-foreground transition-colors hover:border-border-strong focus:border-primary focus:bg-white/[0.05] focus:outline-none focus:ring-3 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/25";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(fieldBase, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(fieldBase, "min-h-28 py-2.5 leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(fieldBase, "h-11 appearance-none bg-card", className)} {...props} />;
}

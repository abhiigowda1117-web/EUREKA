import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-border-strong bg-white/[0.04] text-muted-foreground",
        primary: "border-primary/30 bg-primary/10 text-blue-300",
        success: "border-success/30 bg-success/10 text-emerald-300",
        warning: "border-warning/30 bg-warning/10 text-amber-300",
        destructive: "border-destructive/30 bg-destructive/10 text-red-300",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({ className, variant, ...props }: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

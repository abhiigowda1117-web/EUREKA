import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const styles = {
  info: { box: "border-primary/30 bg-primary/[0.08] text-blue-100", Icon: Info },
  success: { box: "border-success/30 bg-success/[0.08] text-emerald-100", Icon: CheckCircle2 },
  warning: { box: "border-warning/30 bg-warning/[0.08] text-amber-100", Icon: TriangleAlert },
  error: { box: "border-destructive/30 bg-destructive/[0.08] text-red-100", Icon: AlertCircle },
};

export function Alert({
  variant = "info",
  title,
  children,
  className,
}: {
  variant?: keyof typeof styles;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const { box, Icon } = styles[variant];
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-lg border p-3.5 text-sm", box, className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="space-y-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className="text-[13px] leading-relaxed opacity-90">{children}</div>}
      </div>
    </div>
  );
}

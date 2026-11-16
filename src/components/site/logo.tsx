import Link from "next/link";
import { cn } from "@/lib/utils";

/** EUREKA mark: an anvil-spark glyph built from simple shapes (original artwork). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <defs>
        <linearGradient id="eureka-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="#0F1729" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" stroke="url(#eureka-g)" strokeOpacity="0.5" fill="none" />
      <path d="M9 8h14l-2.5 3.5H13v3h7l-2.5 3.5H13v3h10l-2.5 3.5H9V8Z" fill="url(#eureka-g)" />
      <circle cx="23" cy="20" r="1.6" fill="#22D3EE" />
      <circle cx="25.5" cy="16.5" r="1" fill="#60A5FA" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5 rounded-lg", className)} aria-label="EUREKA home">
      <LogoMark />
      <span className="text-[17px] font-bold tracking-[0.16em]">EUREKA</span>
    </Link>
  );
}

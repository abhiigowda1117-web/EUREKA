import Image from "next/image";
import { cn, initials } from "@/lib/utils";

export function Avatar({
  src,
  name,
  size = 40,
  className,
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/40 to-accent/30 font-semibold text-white ring-1 ring-white/10",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.36) }}
    >
      {src ? (
        <Image src={src} alt={`${name}'s profile picture`} fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <span aria-hidden>{initials(name)}</span>
      )}
      {!src && <span className="sr-only">{name}</span>}
    </span>
  );
}

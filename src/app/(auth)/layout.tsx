import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex overflow-hidden min-h-[calc(100dvh-4rem)] items-start justify-center px-4 py-12 sm:items-center sm:py-16">
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div aria-hidden className="absolute left-1/2 top-1/3 -z-10 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

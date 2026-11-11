import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Account suspended" };

export default function SuspendedPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlert className="size-5" aria-hidden />
      </span>
      <h1 className="mt-5 text-2xl font-semibold">Your account is suspended</h1>
      <p className="mt-2 text-muted-foreground">
        This account was suspended for breaking the community guidelines. If you believe this is a mistake, contact the FORGE team.
      </p>
      <form action="/auth/signout" method="post" className="mt-8">
        <button type="submit" className="text-sm text-primary hover:underline">Log out</button>
      </form>
    </div>
  );
}

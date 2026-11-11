"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import type { MenuUser } from "./user-menu";

export function MobileNav({ links, user }: { links: { href: string; label: string }[]; user: MenuUser | null }) {
  const [open, setOpen] = useState(false);
  // Stop the page scrolling behind the open menu; close on Escape.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const link = "block rounded-lg px-3 py-3 text-base text-muted-foreground hover:bg-white/[0.05] hover:text-foreground";

  return (
    <div className="ml-auto md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto border-t border-border bg-background px-4 py-4"
          // Any link click inside the menu navigates away, so close it.
          onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
        >
          {user && (
            <div className="mb-3 flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <Avatar src={user.avatarUrl} name={user.name} size={40} />
              <div className="min-w-0">
                <p className="truncate font-medium">{user.name}</p>
                {user.username && <p className="truncate text-sm text-muted-foreground">@{user.username}</p>}
              </div>
            </div>
          )}
          <nav aria-label="Mobile">
            <ul className="space-y-0.5">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={link}>
                    {l.label}
                  </Link>
                </li>
              ))}
              {user && (
                <>
                  <li className="my-2 h-px bg-border" />
                  <li><Link href="/dashboard" className={link}>Dashboard</Link></li>
                  {user.username && <li><Link href={`/u/${user.username}`} className={link}>View profile</Link></li>}
                  <li><Link href="/settings/profile" className={link}>Edit profile</Link></li>
                </>
              )}
            </ul>
          </nav>
          <div className="mt-6 grid gap-2">
            {user ? (
              <form action="/auth/signout" method="post">
                <button type="submit" className="h-12 w-full rounded-lg border border-border-strong text-sm font-medium">
                  Log out
                </button>
              </form>
            ) : (
              <>
                <ButtonLink href="/signup" size="lg">Get started</ButtonLink>
                <ButtonLink href="/login" variant="secondary" size="lg">Log in</ButtonLink>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

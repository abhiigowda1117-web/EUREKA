"use client";

import { LayoutDashboard, LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";

export type MenuUser = { name: string; username: string | null; avatarUrl: string | null; isAdmin: boolean };

export function UserMenu({ user }: { user: MenuUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape (keyboard accessibility).
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item = "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-white/[0.06] hover:text-foreground";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full p-0.5 pr-3 text-sm hover:bg-white/[0.06]"
      >
        <Avatar src={user.avatarUrl} name={user.name} size={32} />
        <span className="max-w-32 truncate">{user.name}</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 animate-fade-up rounded-xl border border-border-strong bg-card p-1.5 shadow-2xl"
          onClick={() => setOpen(false)}
        >
          <Link role="menuitem" href="/dashboard" className={item}>
            <LayoutDashboard className="size-4" aria-hidden /> Dashboard
          </Link>
          {user.username && (
            <Link role="menuitem" href={`/u/${user.username}`} className={item}>
              <UserRound className="size-4" aria-hidden /> View profile
            </Link>
          )}
          <Link role="menuitem" href="/settings/profile" className={item}>
            <Settings className="size-4" aria-hidden /> Edit profile
          </Link>
          <div className="my-1 h-px bg-border" />
          <form action="/auth/signout" method="post">
            <button role="menuitem" type="submit" className={`${item} w-full`}>
              <LogOut className="size-4" aria-hidden /> Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

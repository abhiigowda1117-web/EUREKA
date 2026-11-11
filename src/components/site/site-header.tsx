import { getCurrentProfile, getSessionUser } from "@/lib/auth";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";
import { UserMenu } from "./user-menu";

export const NAV_LINKS = [
  { href: "/projects", label: "Explore Projects" },
  { href: "/projects/new", label: "Post a Project" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/guidelines", label: "Guidelines" },
];

export async function SiteHeader() {
  const user = await getSessionUser();
  const profile = user ? await getCurrentProfile() : null;
  const menuUser = profile
    ? { name: profile.full_name || user!.email, username: profile.username, avatarUrl: profile.avatar_url, isAdmin: profile.role === "admin" }
    : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden flex-1 md:block">
          <NavLinks links={NAV_LINKS} />
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          {menuUser ? (
            <UserMenu user={menuUser} />
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">
                Log in
              </ButtonLink>
              <ButtonLink href="/signup" size="sm">
                Get started
              </ButtonLink>
            </>
          )}
        </div>
        <MobileNav links={NAV_LINKS} user={menuUser} />
      </div>
    </header>
  );
}

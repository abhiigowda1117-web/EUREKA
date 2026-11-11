import Link from "next/link";
import { LogoMark } from "./logo";

const columns = [
  {
    title: "Marketplace",
    links: [
      { href: "/projects", label: "Explore projects" },
      { href: "/projects/new", label: "Post a project" },
      { href: "/signup", label: "Join as a freelancer" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#faq", label: "FAQ" },
      { href: "/guidelines", label: "Community guidelines" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms of service" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/guidelines#academic-integrity", label: "Academic integrity" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-[17px] font-bold tracking-[0.18em]">FORGE</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Where Talent Meets Opportunity. A marketplace built for India&apos;s students, freelancers and the people who
            need their skills.
          </p>
          <p className="mt-4 text-sm font-medium text-foreground/90">We don&apos;t just imagine. We forge.</p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="text-sm font-semibold">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-subtle-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} FORGE. All prices in Indian Rupees (₹).</p>
          <p>FORGE does not process or hold payments. Clients and freelancers settle payments directly.</p>
        </div>
      </div>
    </footer>
  );
}

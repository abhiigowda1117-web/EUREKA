import Link from "next/link";
import type { Category } from "@/lib/types";
import { CategoryIcon } from "./category-icon";
import { Section, SectionHeading } from "./section";

export function Categories({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;
  return (
    <Section id="categories" className="bg-surface">
      <SectionHeading
        eyebrow="Popular categories"
        title="Whatever you need built, there's someone ready"
        description="From code to design to documentation — legitimate, professional work across 15 categories."
      />
      <ul className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((c) => (
          <li key={c.id}>
            <Link
              href={`/projects?category=${c.slug}`}
              className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card-hover sm:p-5"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-white/[0.04] text-primary transition-colors group-hover:bg-primary/15">
                <CategoryIcon name={c.icon} className="size-5" />
              </span>
              <span className="text-sm font-medium leading-snug">{c.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

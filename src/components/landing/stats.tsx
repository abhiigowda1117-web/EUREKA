import { Section } from "./section";

type Stats = { members: number; openProjects: number; completedProjects: number } | null;

export function PlatformStats({ stats, categories }: { stats: Stats; categories: number }) {
  const items = [
    { label: "Members", value: stats?.members },
    { label: "Open projects", value: stats?.openProjects },
    { label: "Completed projects", value: stats?.completedProjects },
    { label: "Categories", value: categories || undefined },
  ];
  return (
    <Section id="stats" className="border-y border-border bg-surface py-16 sm:py-16">
      <dl className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-sm text-muted-foreground">{item.label}</dt>
            <dd className="mt-2 text-4xl font-semibold tracking-tight">
              {item.value === undefined ? "—" : item.value.toLocaleString("en-IN")}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-8 text-center text-xs text-subtle-foreground">
        {stats ? "Live numbers from the FORGE database. We're early — and we'd rather show you the truth." : "Statistics appear once the database is connected."}
      </p>
    </Section>
  );
}

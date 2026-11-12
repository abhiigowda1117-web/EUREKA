import { Skeleton } from "@/components/ui/skeleton";

// Shown instantly while a server page loads its data.
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-3 h-5 w-96 max-w-full" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
      </div>
    </div>
  );
}

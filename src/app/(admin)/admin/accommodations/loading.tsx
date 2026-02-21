import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-72 animate-skeleton" />

      <header className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-7 w-72 animate-skeleton" />
          <Skeleton className="h-4 w-96 animate-skeleton" />
        </div>

        <div className="flex gap-4">
          <Skeleton className="h-10 w-40 animate-skeleton" />
          <Skeleton className="h-10 w-44 animate-skeleton" />
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl animate-skeleton" />
        ))}
      </div>

      <div className="rounded-xl border bg-white p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-56 animate-skeleton" />
            <Skeleton className="h-4 w-64 animate-skeleton" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40 animate-skeleton" />
            <Skeleton className="h-10 w-44 animate-skeleton" />
          </div>
        </div>

        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full animate-skeleton" />
          ))}
        </div>
      </div>
    </div>
  );
}

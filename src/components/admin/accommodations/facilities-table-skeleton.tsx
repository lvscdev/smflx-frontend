import { Skeleton } from "@/components/ui/skeleton";

export function FacilitiesTableSkeletonRows() {
  return (
    <div className="space-y-3 py-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="grid grid-cols-7 gap-4 items-center px-4 py-3">
          <Skeleton className="h-4 w-24 animate-skeleton" />
          <Skeleton className="h-4 w-40 animate-skeleton" />
          <Skeleton className="h-4 w-20 animate-skeleton" />
          <Skeleton className="h-4 w-24 animate-skeleton" />
          <Skeleton className="h-4 w-24 animate-skeleton" />
          <Skeleton className="h-4 w-16 animate-skeleton" />
          <Skeleton className="h-8 w-8 rounded-md justify-self-end animate-skeleton" />
        </div>
      ))}
    </div>
  );
}

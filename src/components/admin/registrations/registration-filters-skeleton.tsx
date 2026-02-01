import { Skeleton } from "@/components/ui/skeleton";

function RegistrationsFiltersSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
      <Skeleton className="h-9 w-64 animate-skeleton" />

      <Skeleton className="h-9 w-40 animate-skeleton" />
      <Skeleton className="h-9 w-40 animate-skeleton" />
      <Skeleton className="h-9 w-40 animate-skeleton" />

      <Skeleton className="h-9 w-24 animate-skeleton" />

      <div className="flex-1" />

      <Skeleton className="h-9 w-28 animate-skeleton" />
    </div>
  );
}

export { RegistrationsFiltersSkeleton };

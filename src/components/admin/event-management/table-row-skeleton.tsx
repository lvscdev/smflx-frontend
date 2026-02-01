import { Skeleton } from "@/components/ui/skeleton";

function TableRowSkeleton() {
  return (
    <div className="grid grid-cols-6 gap-4 items-center py-3">
      <Skeleton className="h-4 w-12 animate-skeleton" />
      <Skeleton className="h-4 w-48 animate-skeleton" />
      <Skeleton className="h-4 w-20 animate-skeleton" />
      <Skeleton className="h-4 w-24 animate-skeleton" />
      <Skeleton className="h-4 w-20 animate-skeleton" />
      <Skeleton className="h-4 w-16 animate-skeleton" />
    </div>
  );
}

export { TableRowSkeleton };

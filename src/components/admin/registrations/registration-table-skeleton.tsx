import { Skeleton } from "@/components/ui/skeleton";

function TableRowSkeleton() {
  return (
    <div className="grid grid-cols-8 gap-4 py-3 items-center">
      <Skeleton className="h-4 w-32 animate-skeleton" /> {/* Name */}
      <Skeleton className="h-4 w-40 animate-skeleton" /> {/* Email */}
      <Skeleton className="h-4 w-20 animate-skeleton" /> {/* Type */}
      <Skeleton className="h-4 w-16 animate-skeleton" /> {/* Gender */}
      <Skeleton className="h-4 w-20 animate-skeleton" /> {/* Payment */}
      <Skeleton className="h-4 w-28 animate-skeleton" /> {/* Accommodation */}
      <Skeleton className="h-4 w-16 animate-skeleton" /> {/* Status */}
      <Skeleton className="h-4 w-14 animate-skeleton" /> {/* Actions */}
    </div>
  );
}

function RegistrationsTableSkeleton() {
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      {/* Table header */}
      <div className="bg-slate-100 p-4">
        <Skeleton className="h-5 w-full animate-skeleton" />
      </div>

      {/* Rows */}
      <div className="space-y-2 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export { RegistrationsTableSkeleton };

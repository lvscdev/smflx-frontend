import { Skeleton } from "@/components/ui/skeleton";
import { StatsCardSkeleton } from "@/components/admin/event-management/stats-card-skeleton";
import { TableRowSkeleton } from "@/components/admin/event-management/table-row-skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64 animate-skeleton" />
          <Skeleton className="h-4 w-80 animate-skeleton" />
        </div>

        <Skeleton className="h-10 w-40 rounded-md animate-skeleton" />
      </header>

      {/* Current Event Card */}
      <div className="rounded-2xl border border-slate-300 bg-slate-50 p-6 space-y-6">
        {/* Title */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-72 animate-skeleton" />
            <Skeleton className="h-4 w-56 animate-skeleton" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full animate-skeleton" />
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Skeleton className="h-9 w-32 rounded-md animate-skeleton" />
        </div>
      </div>

      {/* Past Events */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32 animate-skeleton" />

        <div className="border border-slate-200 rounded-3xl overflow-hidden">
          {/* Table header */}
          <div className="bg-slate-100 p-4">
            <Skeleton className="h-5 w-full animate-skeleton" />
          </div>

          {/* Rows */}
          <div className="space-y-2 p-4">
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

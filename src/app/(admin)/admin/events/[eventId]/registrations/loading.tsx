import { Skeleton } from "@/components/ui/skeleton";
import { RegistrationStatsSkeleton } from "@/components/admin/registrations/registration-stats-skeleton";
import { RegistrationsFiltersSkeleton } from "@/components/admin/registrations/registration-filters-skeleton";
import { RegistrationsTableSkeleton } from "@/components/admin/registrations/registration-table-skeleton";

export default function Loading() {
  return (
    <div className="space-y-18">
      {/* Header */}
      <div className="flex justify-between gap-2">
        <div className="space-y-2">
          <Skeleton className="h-6 w-64 animate-skeleton" />
          <Skeleton className="h-4 w-80 animate-skeleton" />
        </div>

        <div className="flex gap-4">
          <Skeleton className="h-9 w-40 animate-skeleton" />
          <Skeleton className="h-9 w-32 animate-skeleton" />
          <Skeleton className="h-9 w-36 animate-skeleton" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <RegistrationStatsSkeleton />
        <RegistrationStatsSkeleton />
        <RegistrationStatsSkeleton />
        <RegistrationStatsSkeleton />
      </div>

      {/* Filters */}
      <RegistrationsFiltersSkeleton />

      {/* Table */}
      <RegistrationsTableSkeleton />
    </div>
  );
}

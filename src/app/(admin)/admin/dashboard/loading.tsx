import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <Skeleton className="h-7 w-32 mb-2 animate-skeleton" />
      </div>

      {/* Stats row (matches DashboardStats) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-slate-50 border border-slate-300 p-5"
          >
            <Skeleton className="h-4 w-24 mb-3 animate-skeleton" />
            <Skeleton className="h-7 w-16 animate-skeleton" />
          </div>
        ))}
      </div>

      {/* Financials + Quick Actions */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Financials (span 2) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-300 p-6 space-y-4">
          <Skeleton className="h-5 w-40 animate-skeleton" />
          <Skeleton className="h-48 w-full animate-skeleton" />
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-slate-300 p-6 space-y-4">
          <Skeleton className="h-5 w-32 animate-skeleton" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full animate-skeleton" />
            <Skeleton className="h-10 w-full animate-skeleton" />
            <Skeleton className="h-10 w-full animate-skeleton" />
          </div>
        </div>
      </section>

      {/* Recent activity */}
      <div className="rounded-2xl border border-slate-300 p-6 space-y-4">
        <Skeleton className="h-5 w-36 animate-skeleton" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full animate-skeleton" />
        ))}
      </div>
    </div>
  );
}

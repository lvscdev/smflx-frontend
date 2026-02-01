import { Skeleton } from "@/components/ui/skeleton";

export function AdminOtpSkeleton() {
  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left image panel */}
      <div className="relative hidden lg:block bg-muted" />

      {/* Right form panel */}
      <div className="flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-xl border-[0.5px] border-slate-300 bg-white px-10 py-12 shadow-card shadow-[#585C5F29]">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="mt-8 space-y-6">
            {/* OTP input */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Verify button */}
            <Skeleton className="h-10 w-full" />

            {/* Footer row */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

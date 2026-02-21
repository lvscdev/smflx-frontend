"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/features/admin/auth/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-muted/40 overflow-auto">
        {/* Sidebar skeleton */}
        <aside className="hidden w-78 shrink-0 py-4 border-r border-neutral-100 bg-slate-200 lg:flex lg:flex-col lg:items-center">
          <Skeleton className="h-14 w-44 mt-2 animate-skeleton" />

          <div className="w-full space-y-3 px-6 py-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full animate-skeleton" />
            ))}
          </div>

          <div className="w-full border-t p-4 mt-auto">
            <Skeleton className="h-10 w-full animate-skeleton" />
          </div>
        </aside>

        <div className="flex flex-1 flex-col min-w-0">
          {/* Navbar skeleton */}
          <header className="flex h-24 items-center justify-between border-b bg-slate-100 px-4 lg:px-16">
            <div className="space-y-2">
              <Skeleton className="h-7 w-64 animate-skeleton" />
              <Skeleton className="h-4 w-80 animate-skeleton" />
            </div>

            <div className="flex items-center gap-3">
              <Skeleton className="h-14 w-72 rounded-2xl animate-skeleton" />
              <Skeleton className="h-14 w-14 rounded-2xl animate-skeleton" />
              <Skeleton className="h-14 w-48 rounded-2xl animate-skeleton" />
            </div>
          </header>

          <main className="flex-1 p-6 lg:p-12 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-56 animate-skeleton" />
              <Skeleton className="h-4 w-80 animate-skeleton" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-24 rounded-lg animate-skeleton"
                />
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Skeleton className="h-56 rounded-2xl lg:col-span-2 animate-skeleton" />
              <Skeleton className="h-56 rounded-2xl animate-skeleton" />
            </div>

            <Skeleton className="h-64 rounded-2xl animate-skeleton" />
          </main>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardStats } from "@/components/admin/dashboard/stats-dashboard";
import { DashboardFinancials } from "@/components/admin/dashboard/financials-dashboard";
import { DashboardQuickActions } from "@/components/admin/dashboard/quick-actions";
import { RecentActivity } from "@/components/admin/dashboard/recent-activity";
import { StatsSkeleton } from "@/components/admin/ui/stat-card-skeleton";

export default async function DashboardPage() {
  // const session = await getServerSession(authOptions);

  // if (!session) redirect("/admin/login");

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-slate-950 mb-2">Overview</h1>
        {/* <p className="text-sm text-muted-foreground">
          Here's what's happening with SMFLX Event
          </p> */}
      </div>

      <div className="space-y-8">
        <Suspense fallback={<StatsSkeleton />}>
          <DashboardStats />
        </Suspense>

        <section className="grid gap-6 lg:grid-cols-3">
          <DashboardFinancials />
          <DashboardQuickActions />
        </section>

        <RecentActivity />
      </div>
    </>
  );
}

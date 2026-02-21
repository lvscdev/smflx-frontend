"use client";

import { useEffect, useState, type ReactElement } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UserRound, Wifi, UsersRoundIcon, FlameKindling } from "lucide-react";

type DashboardStatsData = {
  totalRegistrations: number;
  campers: number;
  nonCampers: number;
  online: number;
};

function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData>({
    totalRegistrations: 0,
    campers: 0,
    nonCampers: 0,
    online: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const res = await fetch("/api/dashboard/registration-stats", {
          cache: "no-store",
        });
        if (!res.ok) return;

        const data = (await res.json()) as DashboardStatsData;
        if (!cancelled) setStats(data);
      } catch {
        // keep defaults on error
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat
        title="Total Registrations"
        value={stats.totalRegistrations}
        icon={<UserRound className="size-6 text-brand-blue-50" />}
      />
      <Stat
        title="Campers"
        value={stats.campers}
        icon={<FlameKindling className="size-6 text-brand-blue-50" />}
      />
      <Stat
        title="Non-Campers"
        value={stats.nonCampers}
        icon={<UsersRoundIcon className="size-6 text-brand-blue-50" />}
      />
      <Stat
        title="Online Attendees"
        value={stats.online}
        icon={<Wifi className="size-6 text-brand-blue-50" />}
      />
    </section>
  );
}

function Stat({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: ReactElement;
}) {
  return (
    <Card className="bg-slate-50 border-slate-300 px-6 py-5">
      <CardContent className="flex items-center px-0">
        <div className="flex justify-between w-full">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-heading font-semibold">{value}</p>
          </div>
          <div
            className={`rounded-sm ${
              icon.type === UserRound
                ? "bg-brand-blue-500"
                : icon.type === FlameKindling
                  ? "bg-brand-yellow-200"
                  : icon.type === UsersRoundIcon
                    ? "bg-indigo-500"
                    : "bg-brand-red"
            } p-1.5 h-fit self-center`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { DashboardStats };

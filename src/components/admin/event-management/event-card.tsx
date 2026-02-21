import { Card, CardContent } from "@/components/ui/card";
import { StatsCard } from "@/components/admin/ui/stats-card";
import { Calendar } from "iconsax-reactjs";

import { EventActions } from "./event-actions";
import { formatDate } from "@/helpers/format-date";
import { Event } from "@/features/admin/events/types";
import { getEventStatusBadge } from "@/helpers/getEventStatus";
import { getRegistrationsByEventId } from "@/features/admin/registration/server-actions";

async function EventCard({ event }: { event: Event }) {
  const role = "ADMIN"; // TODO: replace with real role from session
  const status = getEventStatusBadge(event.eventStatus);

  const { totalRegistrations, stats } = await getRegistrationsByEventId({
    eventId: event.eventId,
    page: 1,
  });

  const totalRevenue = stats.totalRevenueSuccessful;

  return (
    <Card className="rounded-2xl bg-slate-50 border-slate-300">
      <CardContent className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-950">
              {event.eventName}
            </h2>
            <p className="text-muted-foreground">
              {formatDate(event.startDate)} – {formatDate(event.endDate)},{" "}
              {event.eventYear}
            </p>
          </div>

          <Calendar size={48} variant="Bold" className="text-slate-600" />
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            label="Total Registrations"
            value={totalRegistrations ?? 0}
          />

          <StatsCard
            label="Total Revenue"
            value={`₦${totalRevenue.toLocaleString()}`}
          />

          <StatsCard label="Status" value={status.label} />
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <EventActions event={event} role={role} />
        </div>
      </CardContent>
    </Card>
  );
}

export { EventCard };

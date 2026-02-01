import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/admin/ui/stats-card";
import { EventYear } from "@/app/api/event";
import { Calendar } from "iconsax-reactjs";
import { Edit } from "lucide-react";
import { EventActions } from "./event-actions";
import { formatDate } from "@/helpers/format-date";

function EventCard({ event }: { event: EventYear }) {
  const role = "ADMIN"; // Placeholder for user role, replace with actual role fetching logic
  return (
    <Card className="rounded-2xl bg-slate-50 border-slate-300">
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-950">{event.theme}</h2>
            <p className="text-muted-foreground">
              {formatDate(event.startDate)} – {formatDate(event.endDate)}
              {", "}
              {event.year}
            </p>
          </div>
          <Calendar size={48} variant="Bold" className="text-slate-600" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            label="Total Registrations"
            value={event.totalRegistrations}
          />
          <StatsCard
            label="Total Revenue"
            value={`₦${event.totalRevenue.toLocaleString()}`}
          />
          <StatsCard label="Status" value={event.status} />
        </div>

        <div className="flex justify-end">
          <EventActions event={event} role={role} />
        </div>
      </CardContent>
    </Card>
  );
}

export { EventCard };

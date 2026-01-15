import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/admin/ui/stats-card";
import { EventYear } from "@app/api/event";

function EventYearCard({ event }: { event: EventYear }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">{event.year}</h2>
            <p className="text-muted-foreground">
              {event.startDate} – {event.endDate}
            </p>
          </div>
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

        <div className="flex justify-end gap-3">
          <Button variant="secondary">Edit Details</Button>
          <Button variant="ghost">View Reports</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export { EventYearCard };

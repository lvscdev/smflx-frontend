import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EventYear } from "@/app/api/event";

function PastEventsTable({ events }: { events: EventYear[] }) {
  if (!events.length) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Past Events</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Year</TableHead>
            <TableHead>Event Dates</TableHead>
            <TableHead>Total Registrations</TableHead>
            <TableHead>Revenue (₦)</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map(event => (
            <TableRow key={event.year}>
              <TableCell>{event.year}</TableCell>
              <TableCell>
                {event.startDate} – {event.endDate}
              </TableCell>
              <TableCell>{event.totalRegistrations}</TableCell>
              <TableCell>{event.totalRevenue.toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant="destructive">{event.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export { PastEventsTable };

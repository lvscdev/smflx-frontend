"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// import { EventOption } from "@/features/admin/accommodation/types";
import { Event } from "@/features/admin/events/types";

function EventSelect({
  events,
  value,
  onChange,
}: {
  events: Event[];
  value: string;
  onChange: (eventId: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-64 bg-slate-50">
        <SelectValue placeholder="Select Event" />
      </SelectTrigger>

      <SelectContent>
        {events.map(event => (
          <SelectItem key={event.eventId} value={event.eventId}>
            {event.eventName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { EventSelect };

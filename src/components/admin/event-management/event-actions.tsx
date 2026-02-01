"use client";

import { useState } from "react";
// import Link from "next/link";
import { Button } from "@/components/ui/button";
import { canEditEvent } from "@/lib/permissions";
import { EventYear } from "@/app/api/event";
import { EventDetailsModal } from "./event-details-modal";
import Link from "next/link";

export function EventActions({ event, role }: { event: EventYear; role: any }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        {/* <Button
          disabled={!canEditEvent(role, event.status)}
          onClick={() => setEditOpen(true)}
        >
          View / Edit Event
        </Button> */}

        <Button
          onClick={() => setOpen(true)}
          className="bg-brand-red hover:bg-brand-red/80"
        >
          View / Edit Event
        </Button>

        {/* <Link href={`event-management/reports/${event.year}`}>
        </Link> */}
        <Button variant="outline">View Reports</Button>

        <Link href={`/admin/events/${event.id}/registrations`}>
          <Button variant="outline">View Registrations</Button>
        </Link>
      </div>

      <EventDetailsModal
        event={event}
        open={open}
        onClose={() => setOpen(false)}
      />
      {/* <EventDetailsModal
        event={event}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      /> */}
    </>
  );
}

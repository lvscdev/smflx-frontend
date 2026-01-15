"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { canEditEvent } from "@/lib/permissions";
import { EventYear } from "@/app/api/event";

export function EventActions({ event, role }: { event: EventYear; role: any }) {
  return (
    <div className="flex gap-2">
      <Button disabled={!canEditEvent(role, event.status)}>Edit Details</Button>
      <Link href={`/event-management/reports/${event.year}`}>
        <Button variant="outline">View Reports</Button>
      </Link>
    </div>
  );
}

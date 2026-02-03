"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Eye, DocumentText } from "iconsax-reactjs";
import { Profile2User } from "iconsax-reactjs";
import { Badge } from "@/components/ui/badge";
// import { EventYear } from "@/app/api/event";
import { Event } from "@/features/admin/events/types";
import { EventDetailsModal } from "./event-details-modal";
import { formatDate } from "@/helpers/format-date";

function PastEventsTable({ events }: { events: Event[] }) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  if (!events.length) return null;

  return (
    <>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Past Events</h3>

        <Table className="border border-slate-200 rounded-3xl">
          <TableHeader className="bg-slate-100 border-slate-300 text-slate-950">
            <TableRow>
              <TableHead>Year</TableHead>
              <TableHead>Event Dates</TableHead>
              <TableHead>Total Registrations</TableHead>
              <TableHead>Revenue (₦)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {events.map(event => (
              <TableRow key={event.eventYear}>
                <TableCell>{event.eventYear}</TableCell>

                <TableCell className="text-slate-500">
                  {formatDate(event.startDate)} – {formatDate(event.endDate)}
                  {", "}
                  {event.eventYear}
                </TableCell>

                <TableCell>{event.eventYear}</TableCell>

                <TableCell>{event.eventYear.toLocaleString()}</TableCell>

                <TableCell>
                  <Badge variant="default" className="bg-brand-red">
                    {event.eventStatus}
                  </Badge>
                </TableCell>

                {/*Actions */}
                <TableCell>
                  <TooltipProvider>
                    <div className="flex items-center gap-3">
                      {/* <Eye
                        size={24}
                        onClick={() => setSelectedEvent(event)}
                        className="text-slate-500"
                      /> */}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Eye
                            size={20}
                            onClick={() => setSelectedEvent(event)}
                            className="text-slate-500"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View event</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={`/event-management/reports/${event.eventYear}`}
                          >
                            <DocumentText
                              size={20}
                              className="text-brand-blue-500"
                            />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View reports</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={`/admin/events/${event.id}/registrations`}
                          >
                            {/* <Button size="sm" variant="outline">
                        View Registrations
                        </Button> */}
                            <Profile2User
                              size={20}
                              className="text-brand-red"
                            />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View registrations</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ✅ Shared Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          open={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </>
  );
}

export { PastEventsTable };

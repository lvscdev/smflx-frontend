"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventYear } from "@/app/api/event";
import { EditEventForm } from "./edit-event-form";
import { formatDate } from "@/helpers/format-date";

function EventDetailsModal({
  event,
  open,
  onClose,
}: {
  event: EventYear;
  open: boolean;
  onClose: () => void;
}) {
  const isReadOnly = event.status !== "Open";
  const [mode, setMode] = useState<"view" | "edit">("view");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-3xl max-h-[90vh] p-6 space-y-5">
        <DialogHeader className="text-left mt-5">
          <DialogTitle className="text-2xl font-semibold">
            Event Details – {event.year}
          </DialogTitle>
          <p className="text-muted-foreground">
            View and manage all information related to this event.
          </p>
        </DialogHeader>

        <div className="space-y-8 overflow-y-auto scroll-smooth scrollbar-thin">
          {/* Summary Card */}

          <div className="rounded-xl border border-slate-300 bg-slate-50 p-6 grid grid-cols-2 gap-6 shadow-card">
            <div>
              <p className="text-sm text-muted-foreground">Event Theme</p>
              <p className="font-semibold font-heading">{event.theme}</p>
            </div>

            <div className="">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge
                variant="default"
                className={`bg-${
                  event.status === "Ended"
                    ? "brand-red"
                    : event.status === "Open"
                      ? "brand-blue-500"
                      : "green-500"
                }`}
              >
                {event.status}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Event Dates</p>
              <p className="font-semibold font-heading text-base">
                {formatDate(event.startDate)} – {formatDate(event.endDate)}
                {", "}
                {event.year}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Total Registrations
              </p>
              <p className="font-semibold font-heading">
                {event.totalRegistrations}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="font-semibold font-heading">
                ₦{event.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Read-only banner */}
          {isReadOnly && (
            <div className="rounded-lg border border-brand-yellow-500 bg-yellow-50 p-4">
              <p className="font-medium">Read-only Mode</p>
              <p className="text-sm text-muted-foreground">
                This is a past or locked event. No modifications can be made.
                You can only view reports and export data.
              </p>
            </div>
          )}

          {/* View / Edit Toggle */}
          {!isReadOnly && (
            <div className="flex justify-end">
              <Button
                variant="default"
                onClick={() => setMode(mode === "view" ? "edit" : "view")}
                className="bg-brand-red hover:bg-brand-red/80"
              >
                {mode === "view" ? "Edit Event" : "Cancel Editing"}
              </Button>
            </div>
          )}

          {/* Edit Form */}
          {mode === "edit" && (
            <div className="">
              <EditEventForm
                event={event}
                disabled={isReadOnly}
                onSuccess={() => setMode("view")}
              />
            </div>
          )}
        </div>
        {/* Footer */}
        {event.status === "Ended" && (
          <Button className="w-full bg-brand-red hover:bg-brand-red/80 mt-4">
            <Download />
            Download All Reports
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { EventDetailsModal };

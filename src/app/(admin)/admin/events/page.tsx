import { getAllEvents } from "@/features/admin/events/server-actions";
import { EventCard } from "@/components/admin/event-management/event-card";
import { EmptyState } from "@/components/admin/event-management/empty-state";
import { PastEventsTable } from "@/components/admin/event-management/past-events-table";
import { Button } from "@/components/ui/button";
import { CreateEventModal } from "@/components/admin/event-management/create-event-modal";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import EventLoading from "./loading";
import { Event } from "@/features/admin/events/types";

async function EventManagementPage() {
  const events = await getAllEvents();

  console.log("Events:", events);

  const activeEvents = events.filter(
    (e: Event) => e.eventStatus !== "CLOSED", // DRAFT + ACTIVE
  );

  // const pastEvents = events.filter(e => e.eventStatus === "CLOSED");

  return (
    <Suspense fallback={<EventLoading />}>
      <div className="space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Event Management</h1>
            <p className="text-muted-foreground">
              Create and manage events for SMFLX
            </p>
          </div>

          <CreateEventModal>
            <Button className="bg-brand-red hover:bg-brand-red/90 text-white">
              <Plus className="h-4 w-4" />
              Create New Event
            </Button>
          </CreateEventModal>
        </header>

        {/* Empty state */}
        {!events.length && <EmptyState />}

        {/* Active / Draft events */}
        {activeEvents.map((event: Event) => (
          <EventCard key={event.eventId} event={event} />
        ))}

        {/* Past events */}
        {/* {pastEvents.length > 0 && <PastEventsTable events={pastEvents} />} */}
      </div>
    </Suspense>
  );
}

export default EventManagementPage;

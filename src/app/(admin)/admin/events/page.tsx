import { getCurrentEvent, getPastEvents } from "@/app/api/event";
import { EventCard } from "@/components/admin/event-management/event-card";
import { EmptyState } from "@/components/admin/event-management/empty-state";
import { PastEventsTable } from "@/components/admin/event-management/past-events-table";
import { Button } from "@/components/ui/button";
import { CreateEventModal } from "@/components/admin/event-management/create-event-modal";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import EventLoading from "./loading";

async function EventManagementPage() {
  const currentEvent = await getCurrentEvent();
  const pastEvents = await getPastEvents();

  return (
    <Suspense fallback={<EventLoading />}>
      <div className="space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Event Year Management</h1>
            <p className="text-muted-foreground">
              Create and manage event years for SMFLX
            </p>
          </div>
          <CreateEventModal>
            <Button className="bg-brand-red hover:bg-brand-red/90 text-white">
              <Plus className="h-4 w-4" />
              Create New Event
            </Button>
          </CreateEventModal>
        </header>

        {!currentEvent && <EmptyState />}

        {currentEvent && <EventCard event={currentEvent} />}

        {pastEvents && <PastEventsTable events={pastEvents} />}
      </div>
    </Suspense>
  );
}

export default EventManagementPage;

// import { getCurrentEvent, getPastEvents } from "@/app/api/event";
// import { EventYearCard } from "@/components/admin/event-management/event-detail-page";
// import { EmptyState } from "@/components/admin/event-management/empty-state";
// import { PastEventsTable } from "@/components/admin/event-management/past-events-table";
// import { Button } from "@/components/ui/button";

// export default async function EventManagementPage() {
//   const currentEvent = await getCurrentEvent();
//   const pastEvents = await getPastEvents();

//   return (
//     <div className="space-y-8">
//       <header className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-semibold">Event Year Management</h1>
//           <p className="text-muted-foreground">
//             Create and manage event years for SMFLX
//           </p>
//         </div>
//         <Button className="bg-primary">+ Create New Event</Button>
//       </header>

//       {!currentEvent && <EmptyState />}

//       {currentEvent && <EventYearCard event={currentEvent} />}

//       <PastEventsTable events={pastEvents} />
//     </div>
//   );
// }

import { getCurrentEvent, getPastEvents } from "@/app/api/event";
import { EventYearCard } from "@/components/admin/event-management/event-detail-page";
import { EmptyState } from "@/components/admin/event-management/empty-state";
import { PastEventsTable } from "@/components/admin/event-management/past-events-table";
import { Button } from "@/components/ui/button";
import { CreateEventModal } from "@/components/admin/event-management/create-event-modal";

export default async function EventManagementPage() {
  const currentEvent = await getCurrentEvent();
  const pastEvents = await getPastEvents();

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Event Year Management</h1>
          <p className="text-muted-foreground">
            Create and manage event years for SMFLX
          </p>
        </div>
        <CreateEventModal>
          <Button className="bg-primary">+ Create New Event</Button>
        </CreateEventModal>
      </header>

      {!currentEvent && <EmptyState />}

      {currentEvent && <EventYearCard event={currentEvent} />}

      <PastEventsTable events={pastEvents} />
    </div>
  );
}

// import { getPastEvents } from "@/app/api/event";
// import { PastEventsTable } from "./past-events-table";
// import { Event } from "@/features/admin/events/types";

// async function PastEventsServerTable({ page }: { page: number }) {
//   const events = await getPastEvents();
//   const pageEvents = events ? events.slice((page - 1) * 10, page * 10) : [];
//   return <PastEventsTable events={pageEvents} />;
// }

// export { PastEventsServerTable };

import { PastEventsTable } from "./past-events-table";
import { getAllEvents } from "@/features/admin/events/server-actions";
import { Event } from "@/features/admin/events/types";

const PAGE_SIZE = 10;

async function PastEventsServerTable({ page }: { page: number }) {
  const events: Event[] = await getAllEvents();

  // ✅ Past events = CLOSED
  const pastEvents = events.filter((e: Event) => e.eventStatus === "CLOSED");

  // ✅ Server-side pagination
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageEvents = pastEvents.slice(start, end);

  return <PastEventsTable events={pageEvents} />;
}

export { PastEventsServerTable };

import { getPastEvents } from "@/app/api/event";
import { PastEventsTable } from "./past-events-table";

async function PastEventsServerTable({ page }: { page: number }) {
  const events = await getPastEvents();
  const pageEvents = events ? events.slice((page - 1) * 10, page * 10) : [];
  return <PastEventsTable events={pageEvents} />;
}

export { PastEventsServerTable };

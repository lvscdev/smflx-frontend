import { getPastEvents } from "@/app/api/event";
import { PastEventsTable } from "./past-events-table";

export async function PastEventsServerTable({ page }: { page: number }) {
  const events = await getPastEvents();
  return <PastEventsTable events={events.slice((page - 1) * 10, page * 10)} />;
}

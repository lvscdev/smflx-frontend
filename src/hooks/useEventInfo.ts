"use client";

import { useEffect, useState } from "react";
import { getAllEvents } from "@/features/admin/events/server-actions";
import { Event } from "@/features/admin/events/types";

export function useEventInfo(eventId: string) {
  const [eventInfo, setEventInfo] = useState<Event | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      const allEvents = await getAllEvents();
      const matchedEvent = allEvents.find(e => e.eventId === eventId) ?? null;
      setEventInfo(matchedEvent);
    }

    fetchEvent();
  }, [eventId]);

  console.log("Event Info:", eventInfo);
  return eventInfo;
}

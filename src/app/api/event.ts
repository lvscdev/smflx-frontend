export type EventYearStatus = "Open" | "Ongoing" | "Ended";

export interface EventYear {
  id: string;
  theme: string;
  year: number;
  startDate: string;
  endDate: string;
  totalRegistrations: number;
  totalRevenue: number;
  status: EventYearStatus;
}

export async function getCurrentEvent(): Promise<EventYear | null> {
  return {
    id: "1",
    theme: "WOTHSMFLX 2026",
    year: 2026,
    startDate: "2026-07-15",
    endDate: "2026-07-20",
    totalRegistrations: 45,
    totalRevenue: 100000000,
    status: "Open",
  };
}
export async function getOngoingEvent(): Promise<EventYear | null> {
  return {
    id: "200",
    theme: "WOTHSMFLX 2026",
    year: 2026,
    startDate: "2026-07-15",
    endDate: "2026-07-20",
    totalRegistrations: 45,
    totalRevenue: 100000000,
    status: "Ongoing",
  };
}

export async function getPastEvents(): Promise<EventYear[] | null> {
  return [
    {
      id: "12",
      theme: "WOTHSMFLX 2025",
      year: 2025,
      startDate: "2025-07-16",
      endDate: "2025-07-21",
      totalRegistrations: 15483,
      totalRevenue: 180567000,
      status: "Ended",
    },
    {
      id: "34",
      theme: "WOTHSMFLX 2024",
      year: 2024,
      startDate: "2024-07-16",
      endDate: "2024-07-21",
      totalRegistrations: 11483,
      totalRevenue: 50567000,
      status: "Ended",
    },
  ];
}

export async function getEventById(eventId: string): Promise<EventYear | null> {
  const current = await getCurrentEvent();
  if (current?.id === eventId) return current;

  const ongoing = await getOngoingEvent();
  if (ongoing?.id === eventId) return ongoing;

  const past = await getPastEvents();
  const match = past?.find(e => e.id === eventId);

  return match ?? null;
}

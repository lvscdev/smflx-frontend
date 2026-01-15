export type EventYearStatus = "Open" | "Ongoing" | "Ended";

export interface EventYear {
  year: number;
  startDate: string;
  endDate: string;
  totalRegistrations: number;
  totalRevenue: number;
  status: EventYearStatus;
}

export async function getCurrentEvent(): Promise<EventYear | null> {
  return {
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
    year: 2026,
    startDate: "2026-07-15",
    endDate: "2026-07-20",
    totalRegistrations: 45,
    totalRevenue: 100000000,
    status: "Ongoing",
  };
}

export async function getPastEvents(): Promise<EventYear[]> {
  return [
    {
      year: 2025,
      startDate: "2025-07-16",
      endDate: "2025-07-21",
      totalRegistrations: 15483,
      totalRevenue: 180567000,
      status: "Ended",
    },
    {
      year: 2024,
      startDate: "2024-07-16",
      endDate: "2024-07-21",
      totalRegistrations: 11483,
      totalRevenue: 50567000,
      status: "Ended",
    },
  ];
}

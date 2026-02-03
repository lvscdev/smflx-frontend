export type EventStatus = "DRAFT" | "ACTIVE" | "CLOSED";

export interface Event {
  eventId: string;
  eventYear: string;
  eventName: string;
  startDate: string;
  endDate: string;
  eventStatus: EventStatus;
  accommodationNeeded: boolean;
  registrationOpenAt: string;
  registrationCloseAt: string;
  description?: string;
}

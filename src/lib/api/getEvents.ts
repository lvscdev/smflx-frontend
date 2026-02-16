import { apiRequest } from "./client";

export interface Event {
  eventId: string;
  eventName: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  ageRanges: string[];
  attendeeTypes: string[];
  maxCapacity: number;
  currentCapacity: number;
  registrationOpen: boolean;
}

export async function getEvents(): Promise<Event[]> {
  return apiRequest<Event[]>("/events", {
    method: "GET",
  });
}

export async function getEventById(eventId: string): Promise<Event> {
  return apiRequest<Event>(`/events/${eventId}`, {
    method: "GET",
  });
}
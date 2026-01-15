"use server";

import { revalidatePath } from "next/cache";
import { EventYear } from "./event";

let EVENTS: EventYear[] = [];

export async function createEvent(event: EventYear) {
  EVENTS.push(event);
  revalidatePath("/event-management");
}

export async function updateEvent(year: number, data: Partial<EventYear>) {
  EVENTS = EVENTS.map(e => (e.year === year ? { ...e, ...data } : e));
  revalidatePath("/event-management");
}

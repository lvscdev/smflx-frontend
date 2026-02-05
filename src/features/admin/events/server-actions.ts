"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
// import { fetchEvents, fetchEventById, fetchActiveEvent } from "./api";
import { Event } from "./types";
import { authHeaders } from "./auth";
import { mapCreateEventFormToApi } from "./event-mapper";
import { createEventSchema, editEventSchema } from "./event-form-schema";

import { assertAdminSession } from "../auth/server-actions";

const BASE_URL = "https://loveseal-events-backend.onrender.com/events";

// export async function getEvents(): Promise<Event[]> {
//   return fetchEvents();
// }

// export async function getEvent(eventId: string): Promise<Event> {
//   return fetchEventById(eventId);
// }

// export async function getActiveEvent(): Promise<Event> {
//   return fetchActiveEvent();
// }

export async function getAllEvents(): Promise<Event[]> {
  const token = (await cookies()).get("admin_session")?.value;
  console.log("Token:", token);
  if (!token) return [];

  const res = await fetch(`${BASE_URL}`, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  console.log("Response:", res);

  if (!res.ok) {
    if (!res.ok) {
      const text = await res.text();
      console.error("Fetch events failed:", res.status, text);
    }

    throw new Error("Failed to fetch events");
  }

  const response = await res.json();
  console.log("All Events Response:", response);

  // ✅ RETURN ARRAY ONLY
  return response.data.data ?? [];
}

// export async function getEventById(eventId: string): Promise<Event | null> {
//   const token = (await cookies()).get("admin_session")?.value;
//   if (!token) return null;

//   const res = await fetch(`${BASE_URL}/${eventId}`, {
//     headers: {
//       accept: "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     cache: "no-store",
//   });

//   if (!res.ok) {
//     const text = await res.text();
//     console.error("Fetch event by ID failed:", res.status, text);
//     return null;
//   }

//   const response = await res.json();
//   console.log("Event by ID Response:", response);

//   return response.data ?? null;
// }
//   const res = await fetch(BASE_URL, {
//     headers: {
//       accept: "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     cache: "no-store",
//   });

//   if (!res.ok) {
//     throw new Error("Failed to fetch events");
//   }

//   const json = await res.json();

//   // assuming backend returns { data: Event[] }
//   return json.data;
// }

// export async function createEvent(input: {
//   eventYear: string;
//   eventName: string;
//   startDate: string;
//   endDate: string;
//   registrationOpenAt: string;
//   registrationCloseAt: string;
//   accommodationNeeded: boolean;
// }) {
//   const res = await fetch(`${BASE_URL}`, {
//     method: "POST",
//     headers: {
//       ...(await authHeaders()),
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       ...input,
//       eventStatus: "DRAFT",
//     }),
//   });

//   if (!res.ok) {
//     throw new Error("Failed to create event");
//   }

//   revalidatePath("/admin/events");
// }

// import { revalidatePath } from "next/cache";

// const BASE_URL = "https://loveseal-events-backend.onrender.com/events";

export async function createEventAction(formValues: unknown) {
  // 🔐 validate again on the server (important)
  const values = createEventSchema.parse(formValues);

  const payload = mapCreateEventFormToApi(values);
  console.log(payload);

  const token = (await cookies()).get("admin_session")?.value;
  if (!token) throw new Error("Unauthorized");

  const session = await assertAdminSession();

  console.log("User Session:", session);
  if (!session) throw new Error("Unauthorized");

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...payload,
      tenantId: session.tenantId,
      eventOwnerId: session.adminUserId,
    }),
  });

  const response = await res.json();
  console.log("CREATE EVENT RESPONSE:", response);

  if (!res.ok) {
    throw new Error("Failed to create event");
  }

  revalidatePath("/admin/events");
}

// export async function updateEvent(id: string, data: Partial<Event>) {
//   const res = await fetch(`${BASE_URL}/${id}`, {
//     method: "PUT",
//     headers: {
//       ...(await authHeaders()),
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });

//   if (!res.ok) throw new Error("Failed to update event");

//   revalidatePath("/admin/events");
// }

import { z } from "zod";

/**
 * Utility: combine date + time → ISO string
 */
function toIso(date: string, time?: string) {
  const value = time ? `${date}T${time}` : date;
  return new Date(value).toISOString();
}

export async function updateEventAction(eventId: string, formValues: unknown) {
  // 1️⃣ Validate input
  const values = editEventSchema.parse(formValues);

  // 2️⃣ Auth
  const session = await assertAdminSession();
  if (!session) throw new Error("Unauthorized");

  const token = (await cookies()).get("admin_session")?.value;
  if (!token) throw new Error("Unauthorized");

  // 3️⃣ Map form → backend payload
  const payload = {
    eventName: values.eventName,
    eventYear: String(values.year),

    startDate: toIso(values.startDate),
    endDate: toIso(values.endDate),

    registrationOpenAt: toIso(
      values.registrationOpens,
      values.registrationOpensTime,
    ),
    registrationCloseAt: toIso(
      values.registrationCloses,
      values.registrationClosesTime,
    ),

    accommodationNeeded: values.accommodationNeeded,
    eventStatus: values.status,

    tenantId: session.tenantId,
    eventOwnerId: session.adminUserId,
  };

  // 4️⃣ Call backend
  const res = await fetch(`${BASE_URL}/${eventId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.message ?? "Failed to update event");
  }

  // 5️⃣ Revalidate UI
  revalidatePath("/admin/events");
}

export async function setEventStatus(
  id: string,
  status: "draft" | "active" | "closed",
) {
  const res = await fetch(`${BASE_URL}/${id}/${status}`, {
    method: "PATCH",
    headers: await authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to update status");

  revalidatePath("/admin/events");
}

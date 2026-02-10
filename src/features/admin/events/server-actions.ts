"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
// import { fetchEvents, fetchEventById, fetchActiveEvent } from "./api";
import { Event } from "./types";
import { authHeaders } from "./auth";
import { mapCreateEventFormToApi } from "./event-mapper";
import { createEventSchema, editEventSchema } from "./event-form-schema";

import { assertAdminSession } from "../auth/server-actions";
import { BASE_URL } from "@/lib/base-url";

const EVENTS_BASE_URL = `${BASE_URL}/events`;

export async function getAllEvents(): Promise<Event[]> {
  const token = (await cookies()).get("admin_session")?.value;
  console.log("Token:", token);
  if (!token) return [];

  const res = await fetch(`${EVENTS_BASE_URL}`, {
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
  console.log("All Events Response:", response.data.data);

  // ✅ RETURN ARRAY ONLY
  return response.data.data ?? [];
}

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

  const res = await fetch(EVENTS_BASE_URL, {
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

// Utility: combine date + time → ISO string
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
  const res = await fetch(`${EVENTS_BASE_URL}/${eventId}`, {
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
  const res = await fetch(`${EVENTS_BASE_URL}/${id}/${status}`, {
    method: "PATCH",
    headers: await authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to update status");

  revalidatePath("/admin/events");
}

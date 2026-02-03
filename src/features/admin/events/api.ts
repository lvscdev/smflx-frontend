// import { cookies } from "next/headers";
// import { Event } from "./types";

// const BASE_URL = "https://loveseal-events-backend.onrender.com/events";

// async function authHeaders() {
//   const token = (await cookies()).get("admin_session")?.value;
//   if (!token) throw new Error("Unauthorized");

//   return {
//     accept: "application/json",
//     Authorization: `Bearer ${token}`,
//   };
// }

// export async function fetchEvents(): Promise<Event[]> {
//   const res = await fetch(BASE_URL, {
//     headers: await authHeaders(),
//     cache: "no-store",
//   });

//   if (!res.ok) throw new Error("Failed to fetch events");
//   return res.json();
// }

// export async function fetchActiveEvent(): Promise<Event> {
//   const res = await fetch(`${BASE_URL}/active`, {
//     headers: await authHeaders(),
//     cache: "no-store",
//   });

//   if (!res.ok) throw new Error("No active event");
//   return res.json();
// }

// export async function fetchEventById(id: string): Promise<Event> {
//   const res = await fetch(`${BASE_URL}/${id}`, {
//     headers: await authHeaders(),
//     cache: "no-store",
//   });

//   if (!res.ok) throw new Error("Event not found");
//   return res.json();
// }

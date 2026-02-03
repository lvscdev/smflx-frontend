// import { cookies } from "next/headers";
// import { Registration } from "./mapped-types";

// const BASE_URL = "https://loveseal-events-backend.onrender.com";

// type GetRegistrationsArgs = {
//   eventId: string;
//   page: number;
//   query?: string;
//   filters?: {
//     type?: string;
//     gender?: string;
//     payment?: string;
//   };
// };

// export async function getRegistrationsPaginated({
//   eventId,
//   page,
//   query,
//   filters,
// }: GetRegistrationsArgs): Promise<{
//   data: Registration[];
//   totalPages: number;
// }> {
//   const token = (await cookies()).get("admin_session")?.value;
//   if (!token) return { data: [], totalPages: 1 };

//   const res = await fetch(`${BASE_URL}/registrations/event/${eventId}`, {
//     headers: {
//       accept: "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     cache: "no-store",
//   });

//   if (!res.ok) {
//     const text = await res.text();
//     console.error("Fetch registrations failed:", res.status, text);
//     throw new Error("Failed to fetch registrations");
//   }

//   const response = await res.json();
//   let registrations: Registration[] = response.data.data ?? [];

//   // 🔎 Search
//   if (query) {
//     const q = query.toLowerCase();
//     registrations = registrations.filter(
//       r =>
//         r.user?.email?.toLowerCase().includes(q) ||
//         r.user?.fullName?.toLowerCase().includes(q),
//     );
//   }

//   // 🧮 Filters
//   if (filters?.type && filters.type !== "all") {
//     registrations = registrations.filter(
//       r => r.participationMode === filters.type,
//     );
//   }

//   if (filters?.gender && filters.gender !== "all") {
//     registrations = registrations.filter(
//       r => r.user?.gender === filters.gender,
//     );
//   }

//   if (filters?.payment && filters.payment !== "all") {
//     registrations = registrations.filter(
//       r => r.paymentStatus === filters.payment,
//     );
//   }

//   // 📄 Pagination
//   const PAGE_SIZE = 10;
//   const totalPages = Math.max(1, Math.ceil(registrations.length / PAGE_SIZE));

//   const start = (page - 1) * PAGE_SIZE;
//   const data = registrations.slice(start, start + PAGE_SIZE);

//   return { data, totalPages };
// }

import { cookies } from "next/headers";
import { Registration } from "./mapped-types";

const BASE_URL = "https://loveseal-events-backend.onrender.com";

type GetRegistrationsArgs = {
  eventId: string;
  page: number;
};

export async function getRegistrationsPaginated({
  eventId,
  page,
}: GetRegistrationsArgs): Promise<{
  data: Registration[];
  totalPages: number;
}> {
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) return { data: [], totalPages: 1 };

  const res = await fetch(
    `${BASE_URL}/registrations/event/${eventId}?page=${page}`,
    {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Fetch registrations failed:", res.status, text);
    throw new Error("Failed to fetch registrations");
  }

  const response = await res.json();

  return {
    data: response.data.data ?? [],
    totalPages: response.data.meta?.totalPages ?? 1,
  };
}

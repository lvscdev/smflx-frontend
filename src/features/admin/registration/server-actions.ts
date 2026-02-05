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

import { Registration } from "./types/mapped-types";
import { RegistrationTableUi } from "./types/registration-ui";

const BASE_URL = "https://loveseal-events-backend.onrender.com";

type GetRegistrationsArgs = {
  eventId: string;
  page: number;
};

async function getUserProfile(userId: string, token: string) {
  const res = await fetch(`${BASE_URL}/user/${userId}`, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Failed to fetch user", userId);
    return null;
  }

  const json = await res.json();
  return json.data?.profileInfo ?? null;
}

// export async function getRegistrationsPaginated({
//   eventId,
//   page,
// }: GetRegistrationsArgs): Promise<{
//   data: Registration[];
//   totalPages: number;
// }> {
//   const token = (await cookies()).get("admin_session")?.value;
//   if (!token) return { data: [], totalPages: 1 };

//   const res = await fetch(
//     `${BASE_URL}/registrations/event/${eventId}?page=${page}`,
//     {
//       headers: {
//         accept: "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       cache: "no-store",
//     },
//   );

//   if (!res.ok) {
//     const text = await res.text();
//     console.error("Fetch registrations failed:", res.status, text);
//     throw new Error("Failed to fetch registrations");
//   }

//   const response = await res.json();
//   console.log("RESPONSE:", response.data.data);

//   return {
//     data: response.data.data ?? [],
//     totalPages: response.data.meta?.totalPages ?? 1,
//   };
// }

// export async function getRegistrationsPaginated({
//   eventId,
//   page,
// }: {
//   eventId: string;
//   page: number;
// }): Promise<{
//   data: RegistrationTableUi[];
//   totalPages: number;
// }> {
//   const token = (await cookies()).get("admin_session")?.value;
//   if (!token) return { data: [], totalPages: 1 };

//   const res = await fetch(
//     `${BASE_URL}/registrations/event/${eventId}?page=${page}`,
//     {
//       headers: {
//         accept: "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       cache: "no-store",
//     },
//   );

//   if (!res.ok) throw new Error("Failed to fetch registrations");

//   const response = await res.json();
//   const registrations: Registration[] = response.data.data ?? [];

//   // ✅ Enrich users in parallel (NO N+1 waterfalls)
//   const enriched = await Promise.all(
//     registrations.map(async r => {
//       const user = await getUserInfo(r.user.userId, token);

//       return {
//         ...r,
//         user: {
//           userId: user.id,
//           name: user.name,
//           email: user.email,
//           gender: user.gender,
//         },
//       };
//     }),
//   );

//   return {
//     data: enriched,
//     totalPages: response.data.meta?.totalPages ?? 1,
//   };
// }

export async function getRegistrationsPaginated({
  eventId,
  page,
}: GetRegistrationsArgs): Promise<{
  data: RegistrationTableUi[];
  totalPages: number;
}> {
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) return { data: [], totalPages: 1 };

  // Fetching registrations
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

  if (!res.ok) throw new Error("Failed to fetch registrations");

  const response = await res.json();
  const registrations: Registration[] = response.data.data ?? [];

  // Enrich registration table with user profile info
  const enriched = await Promise.all(
    registrations.map(async r => {
      const profile = await getUserProfile(r.userId, token);

      return {
        ...r,
        user: {
          id: profile.userId,
          fullName: `${profile.firstName} ${profile.lastName}`,
          email: profile.email,
          gender: profile.gender,
        },
      };
    }),
  );

  return {
    data: enriched,
    totalPages: response.data.meta?.totalPages ?? 1,
  };
}

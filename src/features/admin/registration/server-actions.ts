import { cookies } from "next/headers";

import { Registration } from "./types/mapped-types";
import { RegistrationTableUi } from "./types/registration-ui";
import { BASE_URL } from "@/lib/base-url";

const REGISTRATION_BASE_URL = `${BASE_URL}/registrations`;

type RegistrationFilters = {
  type?: string;
  gender?: string;
  payment?: string;
  q?: string;
};

type GetRegistrationsArgs = {
  eventId: string;
  page: number;
  filters?: RegistrationFilters;
};

async function getUserProfile(eventId: string, userId: string, token: string) {
  const res = await fetch(`${BASE_URL}/admin/dashboard/user-info`, {
    method: "POST",
    headers: {
      "CONTENT-TYPE": "application/json",
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ eventId, userId }),
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Failed to fetch user", userId);
    return null;
  }

  const json = await res.json();
  // console.log("User Profile Response:", json);
  return json.data ?? null;
}

export async function getRegistrationsByEventId({
  eventId,
  page,
  filters,
}: GetRegistrationsArgs): Promise<{
  data: RegistrationTableUi[];
  totalPages: number;
  totalRegistrations: number;
}> {
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) return { data: [], totalPages: 1, totalRegistrations: 0 };

  // Fetching registrations
  const res = await fetch(
    `${REGISTRATION_BASE_URL}/event/${eventId}?page=${page}`,
    {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) throw new Error("Failed to fetch registrations");

  console.log("EVENTID:", eventId);
  const response = await res.json();
  console.log("Response:", response.data.data);
  const registrations: Registration[] = response.data.data ?? [];

  // Enrich registration table with user profile info
  const enriched = await Promise.all(
    registrations.map(async r => {
      const profile = await getUserProfile(r.eventId, r.userId, token);

      // console.log("Profile:", profile);

      return {
        ...r,
        user: {
          id: profile.userId,
          fullName: `${profile.firstName[0].toUpperCase().concat(profile.firstName.slice(1))} ${profile.lastName}`,
          email: profile.email,
          gender: profile.gender,
          paymentStatus: profile.paymentStatus,
          amount: profile.amount,
        },
      };
    }),
  );

  return {
    data: enriched,
    totalPages: response.data.meta?.totalPages ?? 1,
    totalRegistrations: response.data.meta?.totalItems ?? 0,
  };
}

export async function getAllRegistrations(): Promise<{
  data: Registration[];
  totalRegistrations: number;
}> {
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) return { data: [], totalRegistrations: 0 };

  const res = await fetch(`${REGISTRATION_BASE_URL}/all`, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch registrations");

  const response = await res.json();
  const data: Registration[] = response.data?.data ?? [];
  const totalRegistrations = response.data?.meta?.totalItems ?? 0;

  return { data, totalRegistrations };
}

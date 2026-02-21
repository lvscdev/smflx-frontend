import { cookies } from "next/headers";

import { Registration } from "./types/mapped-types";
import { PaymentStatus, RegistrationTableUi } from "./types/registration-ui";
import { Gender } from "./types/api-types";
import { BASE_URL } from "@/lib/base-url";

const REGISTRATION_BASE_URL = `${BASE_URL}/registrations`;
const PAGE_SIZE = 10;

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

function normalizePaymentStatus(value?: string): PaymentStatus {
  const v = String(value ?? "").toUpperCase();
  if (v === "COMPLETED") return "SUCCESSFUL";
  if (v === "SUCCESSFUL") return "SUCCESSFUL";
  if (v === "PENDING") return "PENDING";
  return "false";
}

function normalizeGender(value?: string): Gender {
  return value === "FEMALE" ? "FEMALE" : "MALE";
}

function normalizeText(value?: string) {
  return (value ?? "").trim().toLowerCase();
}

export async function getRegistrationsByEventId({
  eventId,
  page,
  filters,
}: GetRegistrationsArgs): Promise<{
  data: RegistrationTableUi[];
  totalPages: number;
  totalRegistrations: number;
  stats: {
    campers: number;
    nonCampers: number;
    onlineAttendees: number;
  };
}> {
  const token = (await cookies()).get("admin_session")?.value;
  if (!token)
    return {
      data: [],
      totalPages: 1,
      totalRegistrations: 0,
      stats: { campers: 0, nonCampers: 0, onlineAttendees: 0 },
    };

  async function fetchPage(pageNumber: number) {
    const res = await fetch(
      `${REGISTRATION_BASE_URL}/event/${eventId}?page=${pageNumber}`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (!res.ok) throw new Error("Failed to fetch registrations");

    const json = await res.json();
    return {
      rows: (json.data?.data ?? []) as Registration[],
      totalPages: Number(json.data?.meta?.totalPages ?? 1),
    };
  }

  const first = await fetchPage(1);
  const registrations: Registration[] = [...first.rows];

  for (let p = 2; p <= first.totalPages; p++) {
    const next = await fetchPage(p);
    registrations.push(...next.rows);
  }

  // Enrich registration table with user profile info
  const enriched = await Promise.all(
    registrations.map(async r => {
      const profile = await getUserProfile(r.eventId, r.userId, token);

      const firstName = profile?.firstName ?? "";
      const lastName = profile?.lastName ?? "";

      const formattedFirstName =
        firstName.charAt(0).toUpperCase() + firstName.slice(1);

      const fullName = `${formattedFirstName} ${lastName}`.trim();

      return {
        ...r,
        user: {
          id: profile?.userId ?? r.userId,
          fullName: fullName,
          email: profile?.email ?? "",
          gender: normalizeGender(profile?.gender),
          paymentStatus: normalizePaymentStatus(
            profile?.paymentStatus ?? r.paymentStatus,
          ),
          amount: Number(profile?.amount ?? 0),
        },
      };
    }),
  );

  const query = normalizeText(filters?.q);
  const type = (filters?.type ?? "").toUpperCase();
  const gender = (filters?.gender ?? "").toUpperCase();
  const payment = normalizePaymentStatus(filters?.payment);

  const filtered = enriched.filter(r => {
    if (query) {
      const name = normalizeText(r.user?.fullName);
      const email = normalizeText(r.user?.email);
      if (!name.includes(query) && !email.includes(query)) return false;
    }

    if (type && type !== "ALL" && r.participationMode !== type) return false;
    if (gender && gender !== "ALL" && r.user?.gender !== gender) return false;

    if (filters?.payment && filters.payment !== "all") {
      const rowPayment = normalizePaymentStatus(r.user?.paymentStatus);
      if (rowPayment !== payment) return false;
    }

    return true;
  });

  const totalRegistrations = filtered.length;
  const stats = {
    campers: filtered.filter(r => r.participationMode === "CAMPER").length,
    nonCampers: filtered.filter(r => r.participationMode === "NON_CAMPER")
      .length,
    onlineAttendees: filtered.filter(r => r.participationMode === "ONLINE")
      .length,
  };
  const totalPages = Math.max(1, Math.ceil(totalRegistrations / PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const data = filtered.slice(start, start + PAGE_SIZE);

  return {
    data,
    totalPages,
    totalRegistrations,
    stats,
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

  console.log("Registrations:", data);

  return { data, totalRegistrations };
}

"use server";

import { cookies } from "next/headers";
import { createCategorySchema, createFacilitySchema } from "./schemas";

import { roomConfig, FacilityType } from "./room-config";

import { BASE_URL } from "@/lib/base-url";

const ACCOMODATION_BASE_URL = `${BASE_URL}/accommodation`;

type CreateHostelRoomPayload = {
  facilityId: string;
  roomCode: string;
  roomIdentifier: string;
  capacity: number;
  genderRestriction: "MALE" | "FEMALE";
  adminReserved: boolean;
};

type CreateHotelRoomPayload = {
  facilityId: string;
  hotelCode: string;
  hotelIdentifier: string;
  address: string;
  description: string;
  available: boolean;
  genderRestriction: "MALE" | "FEMALE";
  adminReserved: boolean;
  price: number;
  noOfRoomsAvailable: number;
};

export async function createCategoryAction(values: unknown) {
  const token = (await cookies()).get("admin_session")?.value;

  if (!token) throw new Error("Unauthorized");

  const parsed = createCategorySchema.parse(values);

  // 🔥 Transform to backend shape
  const payload = {
    eventId: parsed.eventId,
    categories: parsed.categories.map(name => ({
      name: name.trim(),
    })),
  };

  console.log("PAYLOAD", payload);

  const res = await fetch(`${ACCOMODATION_BASE_URL}/category`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to create categories");
  }

  return data.data;
}

export async function getCategoriesByEvent(eventId: string) {
  const token = (await cookies()).get("admin_session")?.value;

  if (!token) throw new Error("Unauthorized");

  const res = await fetch(
    `${ACCOMODATION_BASE_URL}/admin/categories/${eventId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
      cache: "no-store",
    },
  );

  const data = await res.json();

  if (!res.ok || data.code !== "00") {
    throw new Error(data.message ?? "Failed to fetch categories");
  }

  return data.data;
}

export async function createFacilityAction(values: unknown) {
  const token = (await cookies()).get("admin_session")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const parsed = createFacilitySchema.parse(values);

  console.log("PARSED:", parsed);

  const res = await fetch(`${ACCOMODATION_BASE_URL}/facility`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      accept: "application/json",
    },
    body: JSON.stringify(parsed),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to create facility");
  }

  return data;
}

export async function getFacilitiesByEvent(eventId: string) {
  const token = (await cookies()).get("admin_session")?.value;

  if (!token) throw new Error("Unauthorized");

  const res = await fetch(
    `${ACCOMODATION_BASE_URL}/admin/facilities/${eventId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
      cache: "no-store",
    },
  );

  const data = await res.json();

  if (!res.ok || data.code !== "00") {
    throw new Error(data.message ?? "Failed to fetch facilities");
  }

  return data.data;
}

export async function deleteCategoryAction(categoryId: string) {
  const token = (await cookies()).get("admin_session")?.value;

  if (!token) throw new Error("Unauthorized");

  const res = await fetch(`${BASE_URL}/accommodation/category/${categoryId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "application/json",
    },
  });

  const data = await res.json();

  if (!res.ok || data.code !== "00") {
    throw new Error(data.message ?? "Failed to delete category");
  }

  return data.data;
}

export async function getFacilityDetails(
  facilityType: string,
  facilityId: string,
) {
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) throw new Error("Unauthorized");

  let endpoint = "";

  if (facilityType === "hotel") {
    endpoint = `${ACCOMODATION_BASE_URL}/admin/hotels/${facilityId}`;
  } else if (facilityType === "hostel") {
    endpoint = `${ACCOMODATION_BASE_URL}/admin/hostels/${facilityId}`;
  } else {
    throw new Error("Invalid facility type");
  }

  const res = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "*/*",
    },
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok || data.code !== "00") {
    throw new Error(data.message ?? "Failed to fetch facility details");
  }

  const facilityDetails = data.data;
  console.log("FACILITY dETAILS:", facilityDetails);

  return facilityDetails;
}

export async function createRoomAction(
  facilityId: string,
  facilityType: FacilityType,
  values: unknown,
) {
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) throw new Error("Unauthorized");

  const config = roomConfig[facilityType];

  if (!config) {
    throw new Error("Invalid facility type");
  }

  const parsed = config.schema.parse(values);

  const payload = {
    facilityId,
    ...parsed,
  };

  const res = await fetch(`${ACCOMODATION_BASE_URL}${config.endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || data.code !== "00") {
    throw new Error(data.message ?? "Failed to create room");
  }

  return data;
}

export async function createHostelRoom(payload: CreateHostelRoomPayload) {
  const token = (await cookies()).get("admin_session")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const res = await fetch(`${ACCOMODATION_BASE_URL}/hostel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || data.code !== "00") {
    throw new Error(data?.message ?? "Failed to create hostel room");
  }

  return data.data;
}

export async function createHotelRoom(payload: CreateHotelRoomPayload) {
  const token = (await cookies()).get("admin_session")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const res = await fetch(`${ACCOMODATION_BASE_URL}/hotel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  console.log("PAYLOAD", payload);

  const data = await res.json();

  if (!res.ok || data.code !== "00") {
    throw new Error(data?.message ?? "Failed to create hotel room");
  }

  return data.data;
}

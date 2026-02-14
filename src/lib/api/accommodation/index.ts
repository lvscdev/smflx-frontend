import { apiRequest } from "../client";
import { AccommodationCategories, Facility, HotelRoom } from "./types";

const ACCOMMODATION_BASE = "/accommodation";

/**
 * GET /accommodation/categories/{eventId}
 */
export async function listAccommodationCategories({ eventId }: { eventId: string }) {
  const id = encodeURIComponent(eventId);
  return apiRequest<AccommodationCategories[]>(
    `${ACCOMMODATION_BASE}/categories/${id}`,
    { method: "GET" },
  );
}

/**
 * GET /accommodation/facilities
 */
export async function getFacilitiesByCategoryId(params: {
  categoryId: string;
  gender?: "MALE" | "FEMALE";
  ageRange?: string; // e.g. "13-19"
}) {
  const qs = new URLSearchParams();
  qs.set("categoryId", params.categoryId);
  if (params.gender) qs.set("gender", params.gender);
  if (params.ageRange) qs.set("ageRange", params.ageRange);

  try {
    return await apiRequest<Facility[]>(
      `${ACCOMMODATION_BASE}/facilities?${qs.toString()}`,
      { method: "GET" },
    );
  } catch {
    return apiRequest<Facility[]>(
      `${ACCOMMODATION_BASE}/facility/${encodeURIComponent(params.categoryId)}`,
      { method: "GET" },
    );
  }
}

export async function getAccommodationCategoryFacilities({ categoryId }: { categoryId: string }) {
  return getFacilitiesByCategoryId({ categoryId });
}

/**
 * GET /accommodation/hotels/{facilityId}
 */
export async function getHotelRooms({ facilityId }: { facilityId: string }) {
  const id = encodeURIComponent(facilityId);
  return apiRequest<HotelRoom[]>(`${ACCOMMODATION_BASE}/hotels/${id}`, {
    method: "GET",
  });
}

export type FacilitiesByDemographicsPayload = {
  categoryId: string;
  gender: "MALE" | "FEMALE";
  ageRange: string; // e.g. "13-19"
};

export async function listFacilitiesByDemographics(payload: FacilitiesByDemographicsPayload) {
  try {
    return await getFacilitiesByCategoryId(payload);
  } catch {
    return apiRequest<Facility[]>(`${ACCOMMODATION_BASE}/facilities`, {
      method: "POST",
      body: payload,
    });
  }
}
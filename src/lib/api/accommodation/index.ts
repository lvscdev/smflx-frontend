import { apiRequest } from "../client";
import { AccommodationCategories, Facility, HotelRoom } from "./types";

const ACCOMMODATION_BASE = "/accommodation";

export async function listAccommodationCategories({
  eventId,
}: {
  eventId: string;
}) {
  const id = encodeURIComponent(eventId);

  return apiRequest<AccommodationCategories[]>(
    `${ACCOMMODATION_BASE}/categories/${id}`,
    { method: "GET" },
  );
}

export async function getAccommodationCategoryFacilities({
  categoryId,
}: {
  categoryId: string;
}) {
  return apiRequest<Facility[]>(
    `${ACCOMMODATION_BASE}/facility/${categoryId}`,

    { method: "GET" },
  );
}

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
  return apiRequest<Facility[]>(`${ACCOMMODATION_BASE}/facilities`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

import { ApiError, apiRequest } from "../client";
import { AccommodationCategories, Facility, HotelRoom } from "./types";

const ACCOMMODATION_BASE = "/accommodation";

export async function listAccomodationCategories({
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
  regId,
}: {
  categoryId: string;
  regId?: string;
}) {
  const category = encodeURIComponent(categoryId);
  const reg = regId ? encodeURIComponent(regId) : "";

  if (regId) {
    const q = `categoryId=${category}&regId=${reg}`;

    try {
      return await apiRequest<Facility[]>(`${ACCOMMODATION_BASE}/facility?${q}`, {
        method: "GET",
      });
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 404) {
        return apiRequest<Facility[]>(`/facility?${q}`, { method: "GET" });
      }
      throw e;
    }
  }

  // Legacy fallback
  return apiRequest<Facility[]>(`${ACCOMMODATION_BASE}/facility/${categoryId}`, {
    method: "GET",
  });
}

export async function getHotelRooms({ facilityId }: { facilityId: string }) {
  const id = encodeURIComponent(facilityId);

  return apiRequest<HotelRoom[]>(`${ACCOMMODATION_BASE}/hotels/${id}`, {
    method: "GET",
  });
}

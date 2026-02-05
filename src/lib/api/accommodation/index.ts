import { apiRequest } from "../client";
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
}: {
  categoryId: string;
}) {
  const id = encodeURIComponent(categoryId);

  return apiRequest<Facility[]>(
    `${ACCOMMODATION_BASE}/facility/${id}`,

    { method: "GET" },
  );
}

export async function getHotelRooms({ facilityId }: { facilityId: string }) {
  const id = encodeURIComponent(facilityId);

  return apiRequest<HotelRoom[]>(`${ACCOMMODATION_BASE}/hotels/${id}`, {
    method: "GET",
  });
}

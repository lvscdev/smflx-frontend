import { apiRequest } from "../client";
import { AccommodationCategories, Facility, HotelRoom } from "./types";

export async function listAccomodationCategories({ eventId }: { eventId: string }) {
  const qs = new URLSearchParams({ eventId }).toString();
  const res = await apiRequest<AccommodationCategories[]>(
    `/accommodation/categories?${qs}`,
    {
      method: "GET",
    },
  );

  return res;
}

export async function getAccommodationCategoryFacilities({
  categoryId,
}: {
  categoryId: string;
}) {
  const res = await apiRequest<Facility[]>(
    `/accommodation/facility/${categoryId}`,
    {
      method: "GET",
    },
  );

  return res;
}

export async function getHotelRooms({ facilityId }: { facilityId: string }) {
  const res = await apiRequest<HotelRoom[]>(
    `/accommodation/hotels/${facilityId}`,
    {
      method: "GET",
    },
  );

  return res;
}

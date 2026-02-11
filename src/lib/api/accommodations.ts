/* eslint-disable @typescript-eslint/no-explicit-any */


import { apiRequest } from './client';
import { API_BASE_URL } from "./client";

// ============================================================================
// Types
// ============================================================================

export type BedSpace = {
  bedSpaceId: string;
  bedNumber: string;
  available: boolean;
  price: number;
  currency?: string;
};

export type Room = {
  roomId: string;
  roomNumber: string;
  roomType: string;
  capacity: number;
  bedSpaces: BedSpace[];
  amenities?: string[];
};

export type Facility = {
  facilityId: string;
  name: string;
  description?: string;
  location?: string;
  images?: string[];
  totalSpaces: number;
  availableSpaces: number;
  rooms: Room[];
  amenities?: string[];
};

export type GetAccommodationsResponse = {
  facilities: Facility[];
  metadata?: {
    eventId: string;
    accommodationType: string;
    totalAvailable: number;
  };
};

// Newer facility schema (from the current swagger) is much flatter and does not include
// room/bed-space breakdown for users.
type AccommodationCategory = { id: string; name: string };
type AccommodationFacilityRecord = {
  id?: string;
  facilityId?: string;
  _id?: string;
  eventId?: string;
  facilityName?: string;
  accommodationCategoryId?: string;
  available?: boolean;
  employedUserPrice?: number;
  selfEmployedUserPrice?: number;
  unemployedUserPrice?: number;
  totalCapacity?: number;
};

export type BookAccommodationPayload = {
  eventId: string;
  accommodationType: 'HOSTEL' | 'HOTEL';
  facilityId: string;
  roomId?: string;
  bedSpaceId?: string;
  priceCategory?: 'EMPLOYED' | 'UNEMPLOYED_STUDENT';
};

export type BookAccommodationResponse = {
  bookingId: string;
  facilityId: string;
  facilityName: string;
  roomId?: string;
  roomNumber?: string;
  bedSpaceId?: string;
  bedNumber?: string;
  price: number;
  currency: string;
  bookedAt: string;
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch available accommodations for an event
 * 
 * @param params - Event ID and accommodation type
 * @returns List of facilities with available rooms/bed spaces
 */
export async function getAccommodations(params: {
  eventId: string;
  type: 'HOSTEL' | 'HOTEL';
}): Promise<GetAccommodationsResponse> {

  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
  const want = params.type === 'HOSTEL' ? 'hostel' : 'hotel';

  try {
    const categoriesResp = await apiRequest<any>('/accommodation/categories', { method: 'GET' });
    const categories: AccommodationCategory[] =
      categoriesResp?.data || categoriesResp?.categories || categoriesResp || [];

    const match = (categories || []).find((c) => {
      const name = normalize(String(c?.name || ''));
      return name.includes(want);
    });

    if (!match?.id) throw new Error('Accommodation categories not available');

    const facilitiesResp = await apiRequest<any>(`/accommodation/facility/${match.id}`, { method: 'GET' });
    const raw: AccommodationFacilityRecord[] = facilitiesResp?.data || facilitiesResp?.facilities || facilitiesResp || [];

    const facilities: Facility[] = (raw || [])
      .filter((f) => !f?.eventId || f.eventId === params.eventId)
      .map((f) => {
        const facilityId = String(f?.id || f?.facilityId || f?._id || '');
        return {
          facilityId,
          name: String(f?.facilityName || 'Accommodation Facility'),
          description: undefined,
          location: undefined,
          images: undefined,
          totalSpaces: Number(f?.totalCapacity ?? 0) || 0,
          availableSpaces: f?.available === false ? 0 : Number(f?.totalCapacity ?? 0) || 0,
          rooms: [],
          amenities: undefined,
        };
      })
      .filter((f) => f.facilityId);

    return {
      facilities,
      metadata: {
        eventId: params.eventId,
        accommodationType: params.type,
        totalAvailable: facilities.reduce((sum, f) => sum + (f.availableSpaces || 0), 0),
      },
    };
  } catch {
    const queryParams = new URLSearchParams({
      eventId: params.eventId,
      type: params.type,
    });

    return apiRequest<GetAccommodationsResponse>(
      `/accommodation?${queryParams.toString()}`,
      { method: 'GET' }
    );
  }
}

/**
 * Book selected accommodation
 * 
 * @param payload - Booking details
 * @returns Booking confirmation with price
 */
export async function bookAccommodation(
  payload: BookAccommodationPayload
): Promise<BookAccommodationResponse> {
  return apiRequest<BookAccommodationResponse>(
    '/user-dashboard/book-accommodation',
    { method: 'POST', body: payload }
  );
}

/**
 * Get user's current accommodation bookings
 * 
 * @param eventId - Optional event ID filter
 * @returns List of user's bookings
 */
export async function getMyAccommodations(eventId?: string) {
  const queryParams = eventId 
    ? `?eventId=${encodeURIComponent(eventId)}`
    : '';
  
  return apiRequest<any>(
    `/user-dashboard/accommodations${queryParams}`,
    { method: 'GET' }
  );
}

/**
 * Cancel an accommodation booking
 * 
 * @param bookingId - Booking ID to cancel
 */
export async function cancelAccommodationBooking(bookingId: string) {
  return apiRequest<any>(
    `/user-dashboard/accommodations/${bookingId}`,
    { method: 'DELETE' }
  );
}

/**
 * Get remaining hostel capacity (unoccupied bed spaces).
 * This endpoint is public (no auth required).
 *
 * @returns capacityLeft (number) or null when unavailable
 */
export async function getHostelUnoccupiedCapacity(): Promise<number | null> {
  const url =
    `${API_BASE_URL}/accommodation/hostel/unoccupied`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { accept: '*/*' },
  });

  const json = (await res.json().catch(() => null)) as any;
  const raw = json?.data?.capacityLeft;
  const left = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(left) ? left : null;
}
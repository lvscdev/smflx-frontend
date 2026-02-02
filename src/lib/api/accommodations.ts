/* eslint-disable @typescript-eslint/no-explicit-any */


import { apiRequest } from './client';

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
  const queryParams = new URLSearchParams({
    eventId: params.eventId,
    type: params.type,
  });

  return apiRequest<GetAccommodationsResponse>(
    `/accommodations?${queryParams.toString()}`,
    { method: 'GET' }
  );
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
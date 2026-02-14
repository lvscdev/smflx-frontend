import { apiRequest } from "./client";

export type InitiateHostelAllocationPayload = {
  registrationId: string;
  eventId: string;
  userId: string;
  // NOTE: Backend expects lowercase 'facilityid' (not camelCase 'facilityId')
  // This matches the backend schema exactly - do not change to camelCase
  facilityid: string;
};

export type InitiateHotelAllocationPayload = {
  registrationId: string;
  roomTypeId: string;
  eventId: string;
  userId: string;
  facilityId: string;
};

export type AllocationResponse = {
  checkoutUrl: string;
};

export async function initiateHostelAllocation(
  payload: InitiateHostelAllocationPayload,
) {
  const body = {
    registrationId: payload.registrationId,
    eventId: payload.eventId,
    userId: payload.userId,
    facilityid: payload.facilityid,
  };

  return apiRequest<AllocationResponse>("/allocation/hostel", {
    method: "POST",
    body,
  });
}

export async function initiateHotelAllocation(
  payload: InitiateHotelAllocationPayload,
) {
  const body = {
    registrationId: payload.registrationId,
    roomTypeId: payload.roomTypeId,
    eventId: payload.eventId,
    userId: payload.userId,
    facilityId: payload.facilityId,
  };

  return apiRequest<AllocationResponse>("/allocation/hotel", {
    method: "POST",
    body,
  });
}

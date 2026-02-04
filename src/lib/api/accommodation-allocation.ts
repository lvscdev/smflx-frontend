/* eslint-disable @typescript-eslint/no-explicit-any */

import { apiRequest } from "./client";

// These endpoints are defined in the current swagger under "Accommodation Allocation".
// Note: the swagger schema has an inconsistent key casing for the hostel request
// ("facilityid" vs "facilityId"). We send both to be safe.

export type InitiateHostelAllocationPayload = {
  registrationId: string;
  eventId: string;
  userId: string;
  facilityid: string;
};

export type InitiateHotelAllocationPayload = {
  registrationId: string;
  roomTypeId: string;
  eventId: string;
  userId: string;
  facilityId: string;
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

  return apiRequest<any>("/allocation/hostel", { method: "POST", body });
}

export async function initiateHotelAllocation(
  payload: InitiateHotelAllocationPayload,
) {
  return apiRequest<any>("/allocation/hotel", {
    method: "POST",
    body: payload,
  });
}

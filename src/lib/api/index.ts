/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * lib/api/index.ts
 *
 * Public barrel for all API functions.
 * Logic has been extracted to focused modules; this file re-exports everything
 * so all existing import paths (`@/lib/api`) continue to work unchanged.
 */

import { apiRequest } from "./client";
import type {
  UserProfile as DashboardUserProfile,
} from "./dashboardTypes";

// ─── Re-exports from focused modules ─────────────────────────────────────────

export {
  addDependent,
  addDependants,
  removeDependent,
  payForDependant,
  initiateDependentPayment,
  payForAllDependants,
  type AddDependentPayload,
} from "./dependents";

export {
  initiateRegistrationPayment,
  initiateDependentsPayment,
  verifyPayment,
  type InitiatePaymentResponse,
  type VerifyPaymentResponse,
} from "./payments";

export {
  getUserDashboard,
  type UserProfile,
} from "./dashboard";

export {
  getAccommodations,
  bookAccommodation,
  getMyAccommodations,
  cancelAccommodationBooking,
  type Facility,
  type Room,
  type BedSpace,
  type GetAccommodationsResponse,
  type BookAccommodationPayload,
  type BookAccommodationResponse,
} from "./accommodations";

export {
  initiateHostelAllocation,
  initiateHotelAllocation,
  type InitiateHostelAllocationPayload,
  type InitiateHotelAllocationPayload,
} from "./accommodation-allocation";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type GenerateOtpResponse = { reference: string };

export async function generateLoginOtp(email: string) {
  const response = await apiRequest<any>("/user-auth/generate-otp", {
    method: "POST",
    auth: false,
    body: { email, emailAddress: email },
  });
  return response?.data || response;
}

export async function generateRegistrantOtp(email: string) {
  const response = await apiRequest<any>("/user-auth/otp-for-registrant", {
    method: "POST",
    auth: false,
    body: { email, emailAddress: email },
  });
  return response?.data || response;
}

export async function verifyToken() {
  const response = await apiRequest<any>("/user-auth/login", { method: "GET" });
  return response?.data || response;
}

export type ValidateOtpResponse = {
  token: string;
  userDetails: {
    userId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    gender?: string;
    ageRange?: string;
    localAssembly?: string;
    maritalStatus?: string;
    employmentStatus?: string;
    stateOfResidence?: string | null;
    createdAt?: string;
    updatedAt?: string | null;
  };
};

export async function validateOtp(payload: {
  email: string;
  otp: string;
  otpReference: string;
}) {
  const response = await apiRequest<any>("/user-auth/validate-otp", {
    method: "POST",
    auth: false,
    body: payload,
  });
  return response?.data || response;
}

// ─── User / Profile ───────────────────────────────────────────────────────────

export async function getMe() {
  const response = await apiRequest<any>("/user", { method: "GET" });
  const data = response?.data || response;
  return data?.profileInfo || data;
}

export async function updateMe(payload: Partial<DashboardUserProfile>) {
  const response = await apiRequest<any>("/user", { method: "PUT", body: payload });
  const data = response?.data || response;
  return data?.profileInfo || data;
}

// ─── Events ───────────────────────────────────────────────────────────────────

export type Event = {
  eventId: string;
  eventName: string;
  eventStatus?: string;
  startDate?: string;
  endDate?: string;
  registrationCloseAt?: string;
  ageRanges?: string[];
};

export async function listActiveEvents(options?: { teens?: boolean }) {
  const query = options?.teens ? "?teens=true" : "";
  const response = await apiRequest<any>(`/events/user/active${query}`, {
    method: "GET",
  });
  const data = response?.data || response;
  return data?.activeEvents || [];
}

// ─── Event registrations ──────────────────────────────────────────────────────

export type CreateEventRegistrationPayload = {
  eventId: string;
  participationMode: "CAMPER" | "ATTENDEE" | "ONLINE";
  accommodationType: "HOSTEL" | "HOTEL" | "NONE";
};

export type EventRegistration = {
  registrationId?: string;
  regId?: string;
  userId: string;
  eventId: string;
  eventName?: string;
  participationMode: string;
  accommodationType: string;
  status?: string;
  paymentStatus?: string;
  payment_status?: string;
  attendeeType?: string;
  attendanceType?: string;
  createdAt?: string;
  updatedAt?: string | null;
  [key: string]: unknown;
};

export async function createUserRegistration(
  payload: CreateEventRegistrationPayload,
) {
  const response = await apiRequest<any>("/registrations", {
    method: "POST",
    body: payload,
  });
  return response?.data || response;
}

export async function listMyRegistrations(): Promise<EventRegistration[]> {
  const response = await apiRequest<any>("/registrations/my-registrations", {
    method: "GET",
  });
  return response?.data || response || [];
}
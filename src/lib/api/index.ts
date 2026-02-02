/* eslint-disable @typescript-eslint/no-explicit-any */

import { apiRequest } from './client';

// --- Auth ---

export type GenerateOtpResponse = { reference: string };

// Returning users (must have profile)
export async function generateLoginOtp(email: string) {
  return apiRequest<GenerateOtpResponse>('/user-auth/generate-otp', {
    method: 'POST',
    auth: false,
    body: { email, emailAddress: email },
  });
}

// New registrants (no profile yet)
export async function generateRegistrantOtp(email: string) {
  return apiRequest<GenerateOtpResponse>('/user-auth/otp-for-registrant', {
    method: 'POST',
    auth: false,
    body: { email, emailAddress: email },
  });
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
  return apiRequest<ValidateOtpResponse>('/user-auth/validate-otp', {
    method: 'POST',
    auth: false,
    body: payload,
  });
}

// --- User/Profile ---

export type UserProfile = {
  userId?: string;
  email?: string;
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

export async function getMe() {
  return apiRequest<UserProfile>('/user', { method: 'GET' });
}

export async function updateMe(payload: Partial<UserProfile>) {
  return apiRequest<UserProfile>('/user', { method: 'PUT', body: payload });
}

// --- Events ---

export type Event = {
  eventId: string;
  eventName: string;
  eventStatus?: string;
  startDate?: string;
  endDate?: string;
  registrationCloseAt?: string;
};

export async function listActiveEvents() {
  return apiRequest<any[]>("/events/user/active", { method: "GET" });
}


// --- Event registrations ---

export type CreateEventRegistrationPayload = {
  userId: string;
  eventId: string;
  participationMode: 'CAMPER' | 'ATTENDEE' | 'ONLINE';
  accommodationType: 'HOSTEL' | 'HOTEL' | 'NONE';
};

export type EventRegistration = {
  registrationId?: string;
  userId: string;
  eventId: string;
  participationMode: string;
  accommodationType: string;
  createdAt?: string;
  updatedAt?: string | null;
};

export async function createUserRegistration(payload: CreateEventRegistrationPayload) {
  return apiRequest<EventRegistration>('/event-registrations/user', {
    method: 'POST',
    body: payload,
  });
}

export async function listMyRegistrations() {
  return apiRequest<EventRegistration[]>('/event-registrations/user', { method: 'GET' });
}

// --- User dashboard ---

export type AddDependentPayload = {
  eventId: string;
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE';
};

export async function addDependent(payload: AddDependentPayload) {
  return apiRequest<any>('/user-dashboard/add-dependent', { method: 'POST', body: payload });
}

export async function removeDependent(dependentId: string) {
  return apiRequest<any>(`/user-dashboard/remove-dependent/${dependentId}`, { method: 'DELETE' });
}

export async function payForDependant(payload: { dependantId: string; parentRegId: string }) {
  return apiRequest<any>('/user-dashboard/pay-for-dependants', { method: 'POST', body: payload });
}


export async function getUserDashboard() {
  return apiRequest<any>('/user-dashboard', { method: 'GET' });
}

export type BookAccommodationPayload = {
  eventId: string;
  accommodationType: string;
  facilityId?: string;
  roomId?: string;
  bedSpaceId?: string;
};

export async function bookAccommodation(payload: BookAccommodationPayload) {
  return apiRequest<any>('/user-dashboard/book-accommodation', { method: 'POST', body: payload });
}

// --- Payments (Stage 3) ---

export type InitiatePaymentResponse = {
  checkoutUrl: string;
};

/**
 * Optional payment verification response.
 *
 * NOTE: This is intentionally loose because different payment providers / backends
 * return different shapes. The UI only relies on `status`/`paid` when present.
 */
export type VerifyPaymentResponse = {
  status?: string;
  paid?: boolean;
  reference?: string;
  message?: string;
  data?: any;
};

/**
 * Initiate the primary (camper) registration payment.
 *
 * Backend path differs across environments; this is made configurable to avoid
 * flow changes while Stage 3 contracts stabilize.
 */
export async function initiateRegistrationPayment(payload: {
  amount: number;
  userId: string;
  eventId: string;
  reference: string;
  // keep optional fields for forward-compat
  [key: string]: any;
}) {
  // Swagger: POST /accommodation/initialize
  const path = process.env.NEXT_PUBLIC_ACCOMMODATION_PAYMENT_INIT_PATH || '/accommodation/initialize';

  return apiRequest<InitiatePaymentResponse>(path, {
    method: 'POST',
    body: payload,
  });
}

export async function initiateDependentsPayment(payload: {
  userId: string;
  eventId: string;
  dependentIds?: string[];
  amount?: number;
  currency?: string;
  metadata?: any;
}) {
  const path =
    process.env.NEXT_PUBLIC_DEPENDENTS_PAYMENT_INIT_PATH ||
    '/payments/dependents/initiate';

  return apiRequest<InitiatePaymentResponse>(path, {
    method: 'POST',
    body: payload,
  });
}

/**
 * (Optional) Verify a payment after return from checkout.
 *
 * If your backend exposes a verify endpoint, set NEXT_PUBLIC_PAYMENT_VERIFY_PATH.
 * Example: /payments/verify
 */
export async function verifyPayment(params: {
  reference?: string;
  transactionId?: string;
  [key: string]: any;
}) {
  const path = process.env.NEXT_PUBLIC_PAYMENT_VERIFY_PATH;
  if (!path) {
    // If not configured, callers should treat this as a no-op.
    return null;
  }

  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    qs.set(k, String(v));
  });

  const url = qs.toString() ? `${path}?${qs.toString()}` : path;
  return apiRequest<VerifyPaymentResponse>(url, { method: 'GET' });
}

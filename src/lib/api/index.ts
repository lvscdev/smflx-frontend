/* eslint-disable @typescript-eslint/no-explicit-any */

import { apiRequest } from "./client";
import type {
  NormalizedDashboardResponse,
  UserProfile as DashboardUserProfile,
  DashboardRegistration as DashboardReg,
  DashboardAccommodation as DashboardAcc,
  DashboardDependent as DashboardDep,
  PaymentSummary as DashboardPaymentSummary
} from "./dashboardTypes";

// --- Auth ---

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
  const response = await apiRequest<any>("/user", { method: "GET" });
  return response?.data || response;
}

export async function updateMe(payload: Partial<DashboardUserProfile>) {
  const response = await apiRequest<any>("/user", { method: "PUT", body: payload });
  return response?.data || response;
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
  const response = await apiRequest<any>("/events/user/active", {
    method: "GET",
  });
  
  // Backend returns { data: { activeEvents: [...] } }
  const data = response?.data || response;
  return data?.activeEvents || [];
}

// --- Event registrations ---

export type CreateEventRegistrationPayload = {
  eventId: string;
  participationMode: "CAMPER" | "ATTENDEE" | "ONLINE";
  accommodationType: "HOSTEL" | "HOTEL" | "NONE";
};

export type EventRegistration = {
  registrationId?: string;
  userId: string;
  eventId: string;
  eventName?: string;
  participationMode: string;
  accommodationType: string;
  createdAt?: string;
  updatedAt?: string | null;
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
  // Backend wraps in { code, message, data }
  return response?.data || response || [];
}

// --- User dashboard ---

// NOTE: Backend expects { eventId, regId, name, age, gender }.
export type AddDependentPayload = {
  eventId: string;
  regId: string;
  name: string;
  age?: number;
  gender: "MALE" | "FEMALE";
};

export async function addDependent(payload: AddDependentPayload) {
  // Backend (single): POST /user-dashboard/add-dependant
  const body: Record<string, any> = {
    eventId: payload.eventId,
    regId: payload.regId,
    name: payload.name,
    gender: payload.gender,
  };
  
  // Only include age if it's a valid number
  if (payload.age != null) {
    body.age = Number(payload.age);
  }
  
  console.log("🔵 API Request - addDependent:", {
    endpoint: "/user-dashboard/add-dependant",
    body
  });
  
  const response = await apiRequest<any>("/user-dashboard/add-dependant", {
    method: "POST",
    body,
  });
  
  console.log("🟢 API Response - addDependent:", response);
  return response?.data || response;
}

export async function addDependants(payloads: AddDependentPayload[]) {
  const body = payloads.map((p) => {
    const item: Record<string, any> = {
      eventId: p.eventId,
      regId: p.regId,
      name: p.name,
      gender: p.gender,
    };
    
    // Only include age if it's a valid number
    if (p.age != null) {
      item.age = Number(p.age);
    }
    
    return item;
  });
  
  console.log("🔵 API Request - addDependants:", {
    endpoint: "/user-dashboard/add-dependants",
    count: body.length,
    body
  });
  
  const response = await apiRequest<any>("/user-dashboard/add-dependants", {
    method: "POST",
    body,
  });
  
  console.log("🟢 API Response - addDependants:", response);
  return response?.data || response;
}

export async function removeDependent(dependentId: string) {
  const response = await apiRequest<any>(`/user-dashboard/remove-dependent/${dependentId}`, {
    method: "DELETE",
  });
  return response?.data || response;
}

export async function payForDependant(payload: {
  dependantId: string;
  parentRegId: string;
}) {
  const response = await apiRequest<any>("/user-dashboard/pay-for-dependants", {
    method: "POST",
    body: payload,
  });
  return response?.data || response;
}

export async function initiateDependentPayment(payload: {
  dependantId: string;
  parentRegId: string;
}) {
  const response = await apiRequest<any>("/user-dashboard/pay-for-dependants", {
    method: "POST",
    body: payload,
  });
  
  // The response should contain checkoutUrl
  return response?.data || response;
}

// Dashboard types
export type DashboardRegistration = {
  registrationId: string;
  eventId: string;
  eventName?: string;
  participationMode: string;
  accommodationType: string;
  registrationStatus: string;
  paymentStatus?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type DashboardAccommodation = {
  facilityId?: string;
  facilityName?: string;
  roomNumber?: string;
  bedNumber?: string;
  checkInDate?: string;
  checkOutDate?: string;
  price?: number;
};

export type DashboardDependent = {
  dependentId: string;
  name: string;
  age: number;
  gender: string;
  registrationStatus?: string;
  paymentStatus?: string;
};

export type PaymentSummary = {
  totalPaid?: number;
  totalPending?: number;
  lastPaymentDate?: string;
};

export type UserDashboardData = {
  user?: UserProfile;
  registrations?: DashboardRegistration[];
  accommodations?: DashboardAccommodation[];
  dependents?: DashboardDependent[];
  paymentSummary?: PaymentSummary;
};

/**
 * CRITICAL FIX: Maps participationMode to attendeeType
 * Backend returns participationMode, but Dashboard expects attendeeType
 */
function mapParticipationModeToAttendeeType(mode: string | undefined): string | undefined {
  if (!mode) return undefined;
  
  const modeUpper = mode.toUpperCase();
  
  switch (modeUpper) {
    case "CAMPER":
      return "camper";
    case "ATTENDEE":
      return "physical";
    case "ONLINE":
      return "online";
    default:
      // If already lowercase, return as-is
      return mode.toLowerCase();
  }
}

export async function getUserDashboard(eventId: string): Promise<NormalizedDashboardResponse> {
  const response = await apiRequest<unknown>(`/user-dashboard/${eventId}`, { method: "GET" });

  // Backend often wraps responses in { code, message, data }.
  // We normalize once here so UI code stays typed and stable.
  const root: unknown =
    (response && typeof response === "object" && "data" in (response as Record<string, unknown>))
      ? (response as Record<string, unknown>)["data"]
      : response;

  const obj = (root && typeof root === "object") ? (root as Record<string, unknown>) : {};

  const profileCandidate =
    (obj["profile"] && typeof obj["profile"] === "object") ? (obj["profile"] as Record<string, unknown>) :
    (obj["user"] && typeof obj["user"] === "object") ? (obj["user"] as Record<string, unknown>) :
    null;

  const profileFromFlat = obj;

  const profile: UserProfile = {
    userId: (profileCandidate?.["userId"] as string | undefined) ?? (profileFromFlat["userId"] as string | undefined),
    firstName: (profileCandidate?.["firstName"] as string | undefined) ?? (profileFromFlat["firstName"] as string | undefined),
    lastName: (profileCandidate?.["lastName"] as string | undefined) ?? (profileFromFlat["lastName"] as string | undefined),
    email: (profileCandidate?.["email"] as string | undefined) ?? (profileFromFlat["email"] as string | undefined),
    phoneNumber: (profileCandidate?.["phoneNumber"] as string | undefined) ?? (profileFromFlat["phoneNumber"] as string | undefined),
    gender: (profileCandidate?.["gender"] as string | undefined) ?? (profileFromFlat["gender"] as string | undefined),
    ageRange: (profileCandidate?.["ageRange"] as string | undefined) ?? (profileFromFlat["ageRange"] as string | undefined),
    localAssembly: (profileCandidate?.["localAssembly"] as string | undefined) ?? (profileFromFlat["localAssembly"] as string | undefined),
    maritalStatus: (profileCandidate?.["maritalStatus"] as string | undefined) ?? (profileFromFlat["maritalStatus"] as string | undefined),
    employmentStatus: (profileCandidate?.["employmentStatus"] as string | undefined) ?? (profileFromFlat["employmentStatus"] as string | undefined),
    stateOfResidence: (profileCandidate?.["stateOfResidence"] as string | undefined) ?? (profileFromFlat["stateOfResidence"] as string | undefined),
  };

  const regsUnknown =
    (obj["registrations"] as unknown) ??
    (obj["registration"] as unknown) ??
    (obj["data"] as unknown);

  const registrations: DashboardReg[] = Array.isArray(regsUnknown)
    ? (regsUnknown as unknown[]).filter((r): r is Record<string, unknown> => !!r && typeof r === "object").map((r) => r as DashboardReg)
    : regsUnknown && typeof regsUnknown === "object"
      ? [regsUnknown as DashboardReg]
      : [];

  // CRITICAL FIX: Map participationMode to attendeeType for each registration
  registrations.forEach((reg) => {
    const regObj = reg as Record<string, unknown>;
    
    // If attendeeType is missing but participationMode exists, map it
    if (!regObj.attendeeType && regObj.participationMode) {
      regObj.attendeeType = mapParticipationModeToAttendeeType(regObj.participationMode as string);
    }
    
    // Also ensure eventId is present (some backends might omit it)
    if (!regObj.eventId && eventId) {
      regObj.eventId = eventId;
    }
  

  // If backend returns a "flat" dashboard shape (e.g. regId, attendanceType, eventData)
  // synthesize a single registration so UI logic stays consistent.
  if (registrations.length === 0) {
    const flatRegId =
      (obj["registrationId"] as string | undefined) ??
      (obj["regId"] as string | undefined) ??
      (obj["id"] as string | undefined);

    const participationMode =
      (obj["participationMode"] as string | undefined) ??
      (obj["attendanceType"] as string | undefined) ??
      (obj["attendeeType"] as string | undefined);

    const eventData =
      (obj["eventData"] && typeof obj["eventData"] === "object")
        ? (obj["eventData"] as Record<string, unknown>)
        : null;

    if (flatRegId || participationMode || eventData) {
      const regObj: Record<string, unknown> = {
        registrationId: flatRegId,
        regId: flatRegId,
        eventId: (eventData?.["eventId"] as string | undefined) ?? eventId,
        participationMode,
        attendeeType: mapParticipationModeToAttendeeType(participationMode ?? ""),
        eventTitle:
          (eventData?.["eventTitle"] as string | undefined) ??
          (eventData?.["eventName"] as string | undefined),
        eventName:
          (eventData?.["eventTitle"] as string | undefined) ??
          (eventData?.["eventName"] as string | undefined),
      };

      registrations.push(regObj as DashboardReg);
    }
  }
});

  const accUnknown =
    (obj["accommodations"] as unknown) ??
    (obj["accommodation"] as unknown);

  const accommodations: DashboardAcc[] = Array.isArray(accUnknown)
    ? (accUnknown as unknown[]).filter((a): a is Record<string, unknown> => !!a && typeof a === "object").map((a) => a as DashboardAcc)
    : accUnknown && typeof accUnknown === "object"
      ? [accUnknown as DashboardAcc]
      : [];

  // CRITICAL FIX: Ensure accommodations have eventId
  accommodations.forEach((acc) => {
    const accObj = acc as Record<string, unknown>;
    if (!accObj.eventId && eventId) {
      accObj.eventId = eventId;
    }
  });

  // Dependents/Dependants are notoriously inconsistent in payload shape.
  // IMPORTANT: prioritize nested arrays (e.g. dependants.dependantsData) BEFORE the raw object,
  // otherwise we capture the object and never see the array.
  const depsUnknown =
    (obj["dependents"] as unknown) ??
    (obj["dependentRegistrations"] as unknown) ??
    (obj["dependantsData"] as unknown) ??
    (obj["dependants"] && typeof obj["dependants"] === "object"
      ? (obj["dependants"] as Record<string, unknown>)["dependantsData"]
      : undefined) ??
    (obj["dependants"] as unknown);

  const dependents: DashboardDep[] = Array.isArray(depsUnknown)
    ? (depsUnknown as unknown[]).filter((d): d is Record<string, unknown> => !!d && typeof d === "object").map((d) => d as DashboardDep)
    : [];

  const paymentSummaryUnknown = obj["paymentSummary"] as unknown;
  const paymentSummary: DashboardPaymentSummary | null =
    paymentSummaryUnknown && typeof paymentSummaryUnknown === "object"
      ? (paymentSummaryUnknown as DashboardPaymentSummary)
      : null;

  return {
    eventId,
    profile,
    registrations,
    accommodations,
    dependents,
    paymentSummary,
  };
}

// Re-export accommodation functions
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

// Re-export accommodation allocation functions
export {
  initiateHostelAllocation,
  initiateHotelAllocation,
  type InitiateHostelAllocationPayload,
  type InitiateHotelAllocationPayload,
} from "./accommodation-allocation";

// --- Payments (Stage 3) ---

export type InitiatePaymentResponse = {
  checkoutUrl: string;
};

export type VerifyPaymentResponse = {
  status?: string;
  paid?: boolean;
  reference?: string;
  message?: string;
  data?: any;
};

export async function initiateRegistrationPayment(payload: {
  amount: number;
  userId: string;
  eventId: string;
  reference: string;
  [key: string]: any;
}) {
  const path =
    process.env.NEXT_PUBLIC_ACCOMMODATION_PAYMENT_INIT_PATH ||
    "/accommodation/initialize";

  const response = await apiRequest<any>(path, {
    method: "POST",
    body: payload,
  });
  return response?.data || response;
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
    "/payments/dependents/initiate";

  const response = await apiRequest<any>(path, {
    method: "POST",
    body: payload,
  });
  return response?.data || response;
}

export async function verifyPayment(params: {
  reference?: string;
  transactionId?: string;
  [key: string]: any;
}) {
  const path = process.env.NEXT_PUBLIC_PAYMENT_VERIFY_PATH;
  if (!path) {
    return null;
  }

  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    qs.set(k, String(v));
  });

  const url = qs.toString() ? `${path}?${qs.toString()}` : path;
  const response = await apiRequest<any>(url, { method: "GET" });
  return response?.data || response;
}
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
  isMinister?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
};

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

// --- Events ---

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

// --- Event registrations ---

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

// --- User dashboard ---

export type AddDependentPayload = {
  eventId: string;
  regId: string;
  name: string;
  age?: number;
  gender: "MALE" | "FEMALE";
};

export async function addDependent(payload: AddDependentPayload) {
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
  const endpoint = `/user-dashboard/remove-dependant/${dependentId}`;
  console.log("🗑️ DELETE Request - removeDependent:", {
    endpoint,
    dependentId,
    note: "Using British spelling: 'dependant' not 'dependent'"
  });
  
  const response = await apiRequest<any>(endpoint, {
    method: "DELETE",
  });
  
  console.log("✅ DELETE Response - removeDependent:", response);
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
  reference: string;
  notification_url: string;
  redirect_url: string;
}) {
  const response = await apiRequest<any>("/user-dashboard/pay-for-dependants", {
    method: "POST",
    body: payload,
  });
  return response?.data || response;
}

export async function payForAllDependants(payload: {
  parentRegId: string;
  reference: string;
  notification_url: string;
  redirect_url: string;
}) {
  const response = await apiRequest<any>("/user-dashboard/pay-for-all-dependants", {
    method: "POST",
    body: payload,
  });
  return response?.data || response;
}

function mapParticipationModeToAttendeeType(
  mode: string | undefined
): string | undefined {
  if (!mode) return undefined;

  const m = String(mode).toUpperCase();

  switch (m) {
    case "CAMPER":
      return "camper";
    case "ATTENDEE":
    case "PHYSICAL":
    case "PHYSICAL_ATTENDEE":
      return "physical";
    case "ONLINE":
    case "ONLINE_ATTENDEE":
      return "online";
    default:
      return String(mode).toLowerCase();
  }
}

export async function getUserDashboard(eventId: string): Promise<NormalizedDashboardResponse> {
  const response = await apiRequest<unknown>(`/user-dashboard/${eventId}`, { method: "GET" });
  const obj = (response && typeof response === "object") ? (response as Record<string, unknown>) : {};

  // ── Profile ──────────────────────────────────────────────────────────────────

  const profileNested =
    (obj["profile"] && typeof obj["profile"] === "object") ? (obj["profile"] as Record<string, unknown>) :
    (obj["user"]    && typeof obj["user"]    === "object") ? (obj["user"]    as Record<string, unknown>) :
    null;

  const pSrc = profileNested ?? obj;

  const profile: UserProfile = {
    userId:           (pSrc["userId"]           as string | undefined),
    firstName:        (pSrc["firstName"]        as string | undefined),
    lastName:         (pSrc["lastName"]         as string | undefined),
    email:            (pSrc["email"]            as string | undefined),
    phoneNumber:      (pSrc["phoneNumber"]      as string | undefined),
    gender:           (pSrc["gender"]           as string | undefined),
    ageRange:         (pSrc["ageRange"]         as string | undefined),
    localAssembly:    (pSrc["localAssembly"]    as string | undefined),
    maritalStatus:    (pSrc["maritalStatus"]    as string | undefined),
    employmentStatus: (pSrc["employmentStatus"] as string | undefined),
    stateOfResidence: (pSrc["stateOfResidence"] as string | undefined),
    isMinister: (() => {
      const raw = pSrc["isMinister"] ?? pSrc["is_minister"] ?? pSrc["minister"];
      if (raw === true  || raw === 1 || raw === "true"  || String(raw ?? "").toLowerCase() === "yes") return "yes";
      if (raw === false || raw === 0 || raw === "false" || String(raw ?? "").toLowerCase() === "no")  return "no";
      if (typeof raw === "string" && raw.trim()) return raw.trim().toLowerCase();
      return null;
    })() as string | null | undefined,
  };

  // ── Registrations ────────────────────────────────────────────────────────

  const registrations: DashboardReg[] = [];

  const regsRaw = obj["registrations"] ?? obj["registration"];
  if (Array.isArray(regsRaw) && regsRaw.length > 0) {
    for (const r of regsRaw as Record<string, unknown>[]) {
      const regObj = { ...r } as Record<string, unknown>;
      if (!regObj["eventId"]) regObj["eventId"] = eventId;
      if (!regObj["attendeeType"] && regObj["participationMode"])
        regObj["attendeeType"] = mapParticipationModeToAttendeeType(regObj["participationMode"] as string);
      if (!regObj["attendeeType"] && regObj["attendanceType"])
        regObj["attendeeType"] = mapParticipationModeToAttendeeType(regObj["attendanceType"] as string);
      registrations.push(regObj as DashboardReg);
    }
  } else {
    // Flat shape — build a synthetic registration from top-level fields.
    const flatRegId =
      (obj["regId"]          as string | undefined) ??
      (obj["registrationId"] as string | undefined) ??
      (obj["id"]             as string | undefined);

    const rawMode =
      (obj["participationMode"] as string | undefined) ??
      (obj["attendanceType"]    as string | undefined) ??
      (obj["attendeeType"]      as string | undefined);

    const eventData =
      obj["eventData"] && typeof obj["eventData"] === "object"
        ? (obj["eventData"] as Record<string, unknown>)
        : null;

    const resolvedEventId = (eventData?.["eventId"] as string | undefined) ?? eventId;

    const eventName =
      (eventData?.["eventTitle"] as string | undefined) ??
      (eventData?.["eventName"]  as string | undefined) ??
      (obj["eventTitle"]         as string | undefined) ??
      (obj["eventName"]          as string | undefined);

    if (flatRegId || rawMode || eventData) {
      registrations.push({
        regId:             flatRegId,
        registrationId:    flatRegId,
        eventId:           resolvedEventId,
        eventName,
        eventTitle:        eventName,
        participationMode: rawMode,
        attendanceType:    rawMode,
        attendeeType:      mapParticipationModeToAttendeeType(rawMode ?? ""),
        mealTicket:        obj["mealTicket"],
        userId:            obj["userId"],
      } as DashboardReg);
    }
  }

  // ── Accommodations ───────────────────────────────────────────────────────
  
  const accommodations: DashboardAcc[] = [];

  const accsRaw = obj["accommodations"];
  if (Array.isArray(accsRaw) && accsRaw.length > 0) {
    for (const a of accsRaw as Record<string, unknown>[]) {
      const accObj = { ...(a as Record<string, unknown>) };
      if (!accObj["eventId"]) accObj["eventId"] = eventId;
      accommodations.push(accObj as DashboardAcc);
    }
  } else {
    const accRaw = obj["accommodation"];
    if (accRaw && typeof accRaw === "object") {
      const accObj = { ...(accRaw as Record<string, unknown>) };
      if (!accObj["eventId"]) accObj["eventId"] = eventId;
      accommodations.push(accObj as DashboardAcc);
    }
  }

  // ── Dependents ───────────────────────────────────────────────────────────

  const dependents: DashboardDep[] = [];

  const depsRaw =
    obj["dependents"] ??
    obj["dependentRegistrations"] ??
    obj["dependantsData"] ??
    (obj["dependants"] && typeof obj["dependants"] === "object"
      ? (obj["dependants"] as Record<string, unknown>)["dependantsData"]
      : undefined) ??
    (Array.isArray(obj["dependants"]) ? obj["dependants"] : undefined);

  if (Array.isArray(depsRaw)) {
    for (const d of depsRaw as Record<string, unknown>[]) {
      if (d && typeof d === "object") dependents.push(d as DashboardDep);
    }
  }

  // ── Payment summary ──────────────────────────────────────────────────────
  const paymentSummary: DashboardPaymentSummary | null =
    obj["paymentSummary"] && typeof obj["paymentSummary"] === "object"
      ? (obj["paymentSummary"] as DashboardPaymentSummary)
      : null;

  return { eventId, profile, registrations, accommodations, dependents, paymentSummary };
}

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
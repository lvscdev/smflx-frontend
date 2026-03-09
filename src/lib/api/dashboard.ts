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

// ─── Internal helpers ─────────────────────────────────────────────────────────

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

// ─── UserProfile type (re-exported for convenience) ───────────────────────────

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
  country?: string;
  residentialAddress?: string;
  minister?: boolean;
  isMinister?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
};

// ─── getUserDashboard ─────────────────────────────────────────────────────────

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
import { loadPendingDependentsPayments, clearOldPendingDependentsPayments } from "@/lib/storage/pendingDependentsPayments";
import type { DashboardDependent } from "@/lib/api/dashboardTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Dependent = {
  id: string;
  name: string;
  age: string;
  gender: string;
  isRegistered: boolean;
  isPaid: boolean;
  isProcessing: boolean;
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────

export const getEventId = (registration: unknown): string | undefined => {
  if (typeof registration !== "object" || registration === null) return undefined;

  const reg = registration as Record<string, unknown>;

  if ("eventId" in reg && reg.eventId != null) return String(reg.eventId);

  const evt = reg.event;
  if (typeof evt === "object" && evt !== null) {
    const e = evt as Record<string, unknown>;
    if ("eventId" in e && e.eventId != null) return String(e.eventId);
  }

  return undefined;
};

export const getRegId = (registration: unknown): string | undefined => {
  if (typeof registration !== "object" || registration === null) return undefined;

  const reg = registration as Record<string, unknown>;
  if ("regId" in reg && reg.regId != null) return String(reg.regId);
  if ("registrationId" in reg && reg.registrationId != null) return String(reg.registrationId);
  if ("id" in reg && reg.id != null) return String(reg.id);

  return undefined;
};

export function normalizeAttendeeType(reg: any): "camper" | "physical" | "online" | undefined {
  const raw = reg?.attendeeType ?? reg?.attendanceType ?? reg?.participationMode;
  if (!raw) return undefined;
  const val = String(raw).toLowerCase();
  if (val.includes("camp")) return "camper";
  if (val.includes("online")) return "online";
  return "physical";
}

export function normalizeAccommodation(acc: any) {
  if (!acc) return null;
  const status = String(acc?.status ?? acc?.paymentStatus ?? "").toLowerCase();
  const paid =
    acc?.paidForAccommodation === true ||
    acc?.isPaid === true ||
    status === "paid" ||
    status === "success" ||
    status.includes("paid");

  return {
    ...acc,
    bed: acc?.bed ?? acc?.bedspace ?? acc?.bedSpace ?? acc?.bed_space ?? null,
    paidForAccommodation: paid,
  };
}

export const isDependentProcessing = (dependentId: string): boolean => {
  if (!dependentId) return false;
  clearOldPendingDependentsPayments(3 * 60 * 1000);

  const list = loadPendingDependentsPayments();
  const now = Date.now();
  const TTL_MS = 30 * 60 * 1000;

  return list.some((it) => {
    const ids = Array.isArray(it?.dependantIds) ? it.dependantIds : [];
    if (!ids.includes(dependentId)) return false;
    const startedAtMs = typeof it?.startedAtMs === "number" ? it.startedAtMs : 0;
    if (!startedAtMs) return false;
    if (now - startedAtMs > TTL_MS) return false;
    return true;
  });
};

export const toDependent = (d: DashboardDependent): Dependent => {
  const rec = d as unknown as Record<string, unknown>;

  const id =
    typeof rec.id === "string" && rec.id
      ? rec.id
      : typeof rec.dependantId === "string" && rec.dependantId
        ? rec.dependantId
        : typeof rec.dependentId === "string" && rec.dependentId
          ? rec.dependentId
          : (typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : Math.random().toString(36).slice(2));

  const rawName =
    typeof rec.name === "string" && rec.name ? rec.name :
    typeof rec.fullName === "string" ? rec.fullName :
    typeof rec.dependentName === "string" ? rec.dependentName :
    typeof rec.dependantName === "string" ? rec.dependantName :
    "Dependent";

  const name = rawName.trim() ? rawName.trim() : "Dependent";

  const ageVal = rec.age ?? rec.dependantAge ?? rec.dependentAge;
  const age =
    typeof ageVal === "number" ? String(ageVal) :
    typeof ageVal === "string" ? ageVal.trim() :
    "";

  const genderVal = rec.gender ?? rec.dependantGender ?? rec.dependentGender;
  const gender = typeof genderVal === "string" ? genderVal : "";

  const isRegistered = typeof rec.isRegistered === "boolean" ? rec.isRegistered : true;

  const paymentStatusRaw =
    (rec as any).paymentStatus ??
    (rec as any).payment_state ??
    (rec as any).paymentState ??
    (rec as any).payment ??
    (rec as any).payment_status ??
    (rec as any).status;

  const paymentStatus =
    typeof paymentStatusRaw === "string" ? paymentStatusRaw.toUpperCase() : "";

  const isPaid =
    typeof rec.isPaid === "boolean"
      ? (rec.isPaid as boolean)
      : typeof (rec as any).paid === "boolean"
        ? Boolean((rec as any).paid)
        : ["PAID", "SUCCESS", "COMPLETED", "CONFIRMED"].includes(paymentStatus);

  const isProcessing =
    !isPaid &&
    (["PENDING", "PROCESSING", "INITIATED", "IN_PROGRESS"].includes(paymentStatus) ||
      isDependentProcessing(id));

  return { id, name, age, gender, isRegistered, isPaid, isProcessing };
};

export const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : typeof err === "string" ? err : fallback;

export const asString = (v: unknown) => (typeof v === "string" ? v : "");
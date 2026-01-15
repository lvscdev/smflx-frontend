import { EventYearStatus } from "@/app/api/event";

export type Role = "SUPER_ADMIN" | "ADMIN" | "READ_ONLY";

export function canEditEvent(role: Role, status: EventYearStatus) {
  if (status === "Ended") return false;
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

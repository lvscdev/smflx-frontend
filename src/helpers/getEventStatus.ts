import { EventStatus } from "@/features/admin/events/types";

export function getEventStatusBadge(status: EventStatus) {
  switch (status) {
    case "DRAFT":
      return {
        label: "Open",
        className: "bg-brand-blue-500 text-white",
      };
    case "ACTIVE":
      return {
        label: "Active",
        className: "bg-green-500 text-white",
      };
    case "CLOSED":
      return {
        label: "Ended",
        className: "bg-brand-red text-white",
      };
  }
}

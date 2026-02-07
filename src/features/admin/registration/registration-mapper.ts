import {
  ParticipationMode,
  Gender,
  AccommodationType,
} from "./types/api-types";

import { PaymentStatus } from "./types/registration-ui";

export const participationModeLabel: Record<ParticipationMode, string> = {
  CAMPER: "Camper",
  NON_CAMPER: "Non-Camper",
  ONLINE: "Online",
};

export const genderLabel: Record<Gender, string> = {
  MALE: "Male",
  FEMALE: "Female",
};

export const accommodationTypeLabel: Record<AccommodationType, string> = {
  HOSTEL: "Hostel",
  HOTEL: "Hotel",
  SHARED_APARTMENT: "Shared Apartment",
};

export const paymentStatusBadgeClass: Record<PaymentStatus, string> = {
  COMPLETED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  FAILED: "bg-red-100 text-red-700",
};

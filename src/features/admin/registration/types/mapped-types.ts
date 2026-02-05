// src/types/registration.ts

import {
  ParticipationMode,
  PaymentStatus,
  Gender,
  AccommodationType,
} from "./api-types";

export interface Registration {
  userId: string;
  eventId: string;

  user: {
    id: string;
    fullName: string;
    email: string;
    gender: Gender;
  };

  participationMode: ParticipationMode;
  paymentStatus: PaymentStatus;
  accommodationType: AccommodationType;

  createdAt: string;
}

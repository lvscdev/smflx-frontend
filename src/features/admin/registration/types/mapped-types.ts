import { ParticipationMode, Gender, AccommodationType } from "./api-types";

import { PaymentStatus } from "./registration-ui";

export interface Registration {
  userId: string;
  eventId: string;

  user: {
    id: string;
    fullName: string;
    email: string;
    gender: Gender;
    paymentStatus: PaymentStatus;
    amount: number;
  };

  participationMode: ParticipationMode;
  paymentStatus: PaymentStatus;
  accommodationType: AccommodationType;

  createdAt: string;
}

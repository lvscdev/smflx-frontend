import { Gender } from "./api-types";
import { Registration } from "./mapped-types";

export type PaymentStatus = "COMPLETED" | "PENDING" | "FAILED";

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  COMPLETED: "Completed",
  PENDING: "Pending",
  FAILED: "Failed",
};

export interface RegistrationTableUi extends Registration {
  user: {
    id: string;
    fullName: string;
    email: string;
    gender: Gender;
    paymentStatus: PaymentStatus;
    amount: number;
  };
}

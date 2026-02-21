import { Gender } from "./api-types";
import { Registration } from "./mapped-types";

export type PaymentStatus = "SUCCESSFUL" | "PENDING" | "false";

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  SUCCESSFUL: "Successful",
  PENDING: "Pending",
  false: "Not paid",
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

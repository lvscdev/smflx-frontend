export type RegistrationType = "Camper" | "Non-Camper" | "Online";
export type PaymentStatus = "Completed" | "Pending" | "Failed";
export type Gender = "Male" | "Female";

export interface Registration {
  id: string;
  eventId: string;
  name: string;
  email: string;
  type: RegistrationType;
  gender: Gender;
  payment: PaymentStatus;
  accommodation: string;
}

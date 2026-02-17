import { apiRequest } from "./client";

export interface DependentPaymentItem {
  dependentId: string;
  dependentName: string;
  amount: number;
}

export interface InitiateDependentsPaymentPayload {
  userId: string;
  registrationId: string;
  eventId: string;
  dependents: DependentPaymentItem[];
  totalAmount: number;
}

export interface DependentsPaymentResponse {
  checkoutUrl: string;
  paymentId: string;
  totalAmount: number;
  dependents: DependentPaymentItem[];
}

export async function initiateDependentsPayment(
  payload: InitiateDependentsPaymentPayload
): Promise<DependentsPaymentResponse> {
  return apiRequest<DependentsPaymentResponse>("/payments/dependents", {
    method: "POST",
    body: payload,
  });
}
/* eslint-disable @typescript-eslint/no-explicit-any */

import { apiRequest } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InitiatePaymentResponse = {
  checkoutUrl: string;
};

export type VerifyPaymentResponse = {
  status?: string;
  paid?: boolean;
  reference?: string;
  message?: string;
  data?: any;
};

// ─── Functions ────────────────────────────────────────────────────────────────

export async function initiateRegistrationPayment(payload: {
  amount: number;
  userId: string;
  eventId: string;
  reference: string;
  [key: string]: any;
}) {
  const path =
    process.env.NEXT_PUBLIC_ACCOMMODATION_PAYMENT_INIT_PATH ||
    "/accommodation/initialize";

  const response = await apiRequest<any>(path, {
    method: "POST",
    body: payload,
  });
  return response?.data || response;
}

export async function initiateDependentsPayment(payload: {
  userId: string;
  eventId: string;
  dependentIds?: string[];
  amount?: number;
  currency?: string;
  metadata?: any;
}) {
  const path =
    process.env.NEXT_PUBLIC_DEPENDENTS_PAYMENT_INIT_PATH ||
    "/payments/dependents/initiate";

  const response = await apiRequest<any>(path, {
    method: "POST",
    body: payload,
  });
  return response?.data || response;
}

export async function verifyPayment(params: {
  reference?: string;
  transactionId?: string;
  [key: string]: any;
}) {
  const path = process.env.NEXT_PUBLIC_PAYMENT_VERIFY_PATH;
  if (!path) {
    return null;
  }

  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    qs.set(k, String(v));
  });

  const url = qs.toString() ? `${path}?${qs.toString()}` : path;
  const response = await apiRequest<any>(url, { method: "GET" });
  return response?.data || response;
}
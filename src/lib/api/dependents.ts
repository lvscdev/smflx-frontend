/* eslint-disable @typescript-eslint/no-explicit-any */

import { apiRequest } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AddDependentPayload = {
  eventId: string;
  regId: string;
  name: string;
  age?: number;
  gender: "MALE" | "FEMALE";
};

// ─── Functions ────────────────────────────────────────────────────────────────

export async function addDependent(payload: AddDependentPayload) {
  const body: Record<string, any> = {
    eventId: payload.eventId,
    regId: payload.regId,
    name: payload.name,
    gender: payload.gender,
  };

  // Only include age if it's a valid number
  if (payload.age != null) {
    body.age = Number(payload.age);
  }

  const response = await apiRequest<any>("/user-dashboard/add-dependant", {
    method: "POST",
    body,
  });

  return response?.data || response;
}

export async function addDependants(payloads: AddDependentPayload[]) {
  const body = payloads.map((p) => {
    const item: Record<string, any> = {
      eventId: p.eventId,
      regId: p.regId,
      name: p.name,
      gender: p.gender,
    };

    if (p.age != null) {
      item.age = Number(p.age);
    }

    return item;
  });

  const response = await apiRequest<any>("/user-dashboard/add-dependants", {
    method: "POST",
    body,
  });

  return response?.data || response;
}

export async function removeDependent(dependentId: string) {
  const endpoint = `/user-dashboard/remove-dependant/${dependentId}`;

  const response = await apiRequest<any>(endpoint, {
    method: "DELETE",
  });

  return response?.data || response;
}

export async function payForDependant(payload: {
  dependantId: string;
  parentRegId: string;
}) {
  const response = await apiRequest<any>("/user-dashboard/pay-for-dependants", {
    method: "POST",
    body: payload,
  });
  return response?.data || response;
}

export async function initiateDependentPayment(payload: {
  dependantId: string;
  parentRegId: string;
  reference: string;
  notification_url: string;
  redirect_url: string;
}) {
  const response = await apiRequest<any>("/user-dashboard/pay-for-dependants", {
    method: "POST",
    body: payload,
  });
  return response?.data || response;
}

export async function payForAllDependants(payload: {
  parentRegId: string;
  reference: string;
  notification_url: string;
  redirect_url: string;
}) {
  const response = await apiRequest<any>("/user-dashboard/pay-for-all-dependants", {
    method: "POST",
    body: payload,
  });
  return response?.data || response;
}
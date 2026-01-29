/* eslint-disable @typescript-eslint/no-explicit-any */

import { ApiError } from "@/lib/api/client";

type Feature = "otp" | "events" | "payment" | "profile" | "generic";
type Action = "send" | "verify" | "list" | "init" | "update" | "create";

function isApiError(err: any): err is ApiError {
  return !!err && (err instanceof ApiError || err?.name === "ApiError" || typeof err?.status === "number");
}

function normalizeMessage(msg?: string) {
  return (msg || "").toString().trim();
}

/**
 * Convert technical API errors into user-friendly microcopy.
 *
 * IMPORTANT: We intentionally DO NOT leak raw backend error strings like
 * "Bad Request" or "Unauthorized" to end-users.
 */
export function toUserMessage(
  err: unknown,
  ctx?: {
    feature?: Feature;
    action?: Action;
  }
): string {
  const feature: Feature = ctx?.feature || "generic";
  const action = ctx?.action;

  // Network / fetch errors
  const anyErr: any = err as any;
  const raw = normalizeMessage(anyErr?.message);
  const status = isApiError(anyErr) ? anyErr.status : undefined;

  const rawLower = raw.toLowerCase();

  // Generic auth/session messages
  if (status === 401) {
    // For OTP flows, 401 isn't expected (token not required), so treat as retry.
    if (feature === "otp") return "We couldn’t verify your code right now. Please try again.";
    return "Your session has expired. Please verify your email again.";
  }
  if (status === 403) {
    return "You don’t have permission to perform this action.";
  }

  // OTP-specific translations
  if (feature === "otp") {
    if (action === "send") {
      if (status === 400 && (rawLower.includes("invalid") || rawLower.includes("email"))) {
        return "Please enter a valid email address.";
      }
      return "We couldn’t send a verification code. Please try again.";
    }

    // action === "verify" (or default)
    if (status === 400) {
      if (rawLower.includes("expired")) {
        return "This verification code has expired. Please request a new one.";
      }
      if (rawLower.includes("used")) {
        return "This code has already been used. Please request a new one.";
      }
      if (rawLower.includes("too many") || rawLower.includes("attempt")) {
        return "Too many attempts. Please wait a few minutes and try again.";
      }
      // Most common
      return "The verification code you entered is incorrect.";
    }

    return "We couldn’t verify your code. Please try again.";
  }

  // Events
  if (feature === "events") {
    // Prevent raw backend strings like "Unauthorized Access" showing up.
    if (rawLower.includes("unauthorized")) {
      return "We couldn’t load events right now. Please try again.";
    }
    if (status && status >= 500) {
      return "We couldn’t load events right now. Please try again.";
    }
    return raw || "We couldn’t load events right now. Please try again.";
  }

  // Payments
  if (feature === "payment") {
    if (rawLower.includes("unauthorized")) {
      return "Your session has expired. Please verify your email again.";
    }
    return raw || "Unable to start payment checkout. Please try again.";
  }

  // Profile
  if (feature === "profile") {
    if (status === 400) return "Please check the highlighted fields and try again.";
    return raw || "Unable to save your profile right now. Please try again.";
  }

  // Default
  if (!raw) return "Something went wrong. Please try again.";
  if (rawLower === "bad request" || rawLower.includes("request failed")) {
    return "Something went wrong. Please try again.";
  }
  if (rawLower.includes("unauthorized")) {
    return "Your session has expired. Please verify your email again.";
  }
  return raw;
}

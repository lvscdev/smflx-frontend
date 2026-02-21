"use client";

import { AdminOtpInput, AdminEmailInput } from "./schemas";
import { AdminSessionResponse } from "./types";
import { CLIENT_API_BASE_URL } from "@/lib/base-url";

const AUTH_BASE_URL = `${CLIENT_API_BASE_URL}/admin-x-auth`;

/**
 * Client-side OTP validation
 * Sets admin session token in localStorage and redirects via router
 */
export async function validateAdminOtpClient(input: AdminOtpInput) {
  const res = await fetch(`${AUTH_BASE_URL}/otp-validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Invalid or expired OTP");
  }

  const data = await res.json();
  const token = data.data.token;

  // Store token in localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("admin_session", token);
  }

  return { token, success: true };
}

/**
 * Client-side logout
 * Removes token from localStorage and clears session
 */
export async function logoutAdminClient() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_session");
    document.cookie = "admin_session=; path=/; max-age=0";
  }

  // Return to redirect client-side
  return { success: true };
}

/**
 * Client-side logout used by UI components
 * Clears auth state and redirects to login page
 */
export async function logoutAdmin() {
  await logoutAdminClient();

  if (typeof window !== "undefined") {
    window.location.href = "/admin/login";
  }
}

/**
 * Client-side session validation
 * Checks token and verifies with backend
 */
export async function assertAdminSessionClient(): Promise<AdminSessionResponse | null> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("admin_session")
      : null;

  if (!token) return null;

  try {
    const res = await fetch(`${AUTH_BASE_URL}/login`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      // Token invalid, clear it
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_session");
      }
      return null;
    }

    const response = (await res.json()).data
      .userDetails as AdminSessionResponse;
    return response;
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}

/**
 * Client-side OTP generation/resend
 */
export async function resendAdminOtpClient(input: AdminEmailInput) {
  const res = await fetch(`${AUTH_BASE_URL}/otp-generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData.message || "Too many requests. Please wait and try again.",
    );
  }

  return res.json(); // { data: { reference } }
}

/**
 * Get current token from localStorage
 */
export function getAdminToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("admin_session");
  }
  return null;
}

/**
 * Clear admin session
 */
export function clearAdminSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_session");
  }
}

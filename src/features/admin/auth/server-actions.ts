"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminOtpInput, AdminEmailInput } from "./schemas";
import { AdminSessionResponse } from "./types";
import { cs } from "zod/v4/locales";

const BASE_URL = "https://loveseal-events-backend.onrender.com/admin-x-auth";

export async function validateAdminOtpAction(
  input: AdminOtpInput,
  redirectTo: string,
) {
  const res = await fetch(`${BASE_URL}/otp-validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error("Invalid or expired OTP");
  }

  const data = await res.json();
  console.log("DATA:", data);
  const token = data.data.token;
  console.log("TOKEN:", token);

  // 🔐 Set secure, HTTP-only cookie
  (await cookies()).set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day (align with backend)
  });

  redirect(redirectTo || "/admin");
}

export async function logoutAdmin() {
  (await cookies()).set("admin_session", "", {
    maxAge: 0,
    path: "/",
  });

  redirect("/admin/login");
}

export async function assertAdminSession(): Promise<AdminSessionResponse | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  if (!token) return null;

  const res = await fetch(`${BASE_URL}/login`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  const response = (await res.json()).data.userDetails as AdminSessionResponse;
  console.log("Session Response:", response);

  return response;
}

export async function resendAdminOtpAction(input: AdminEmailInput) {
  const res = await fetch(`${BASE_URL}/otp-generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Too many requests. Please wait and try again.");
  }

  return res.json(); // { otpReference }
}

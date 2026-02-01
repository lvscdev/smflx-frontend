"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminOtpInput, AdminEmailInput } from "./schemas";

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

// export async function assertAdminSession() {
//   const cookieStore = await cookies();
//   const adminSession = cookieStore.get("admin_session")?.value;

//   if (!adminSession) {
//     return false;
//   }

//   const res = await fetch(`${BASE_URL}/login`, {
//     method: "GET",
//     headers: {
//       accept: "application/json",
//       Cookie: `admin_session=${adminSession}`,
//     },
//     cache: "no-store",
//   });

//   return res.ok;
// }

export async function assertAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  console.log(token);

  if (!token) return false;

  const res = await fetch(`${BASE_URL}/login`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`, // ✅ THIS IS KEY
    },
    cache: "no-store",
  });

  return res.ok;
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

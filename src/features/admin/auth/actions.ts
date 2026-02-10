import { AdminEmailInput } from "./schemas";
// import { AdminOtpInput } from "./schemas";

import { CLIENT_API_BASE_URL } from "@/lib/base-url";

const BASE_URL = CLIENT_API_BASE_URL;

export async function generateAdminOtp(input: AdminEmailInput) {
  const res = await fetch(`${BASE_URL}/admin-x-auth/otp-generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(input),
  });
  console.log("RES:", res);
  console.log(BASE_URL);
  if (!res.ok) {
    const errorData = await res.json();

    throw new Error(errorData.message || "Failed to generate OTP");
  }

  return res.json();
}

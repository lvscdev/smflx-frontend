import { AdminEmailInput } from "./schemas";
// import { AdminOtpInput } from "./schemas";

const BASE_URL = "https://loveseal-events-backend.onrender.com/admin-x-auth";

export async function generateAdminOtp(input: AdminEmailInput) {
  const res = await fetch(`${BASE_URL}/otp-generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(input),
  });
  console.log("RES:", res);
  if (!res.ok) {
    const errorData = await res.json();

    throw new Error(errorData.message || "Failed to generate OTP");
  }

  return res.json();
}

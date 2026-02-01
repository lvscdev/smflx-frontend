import { z } from "zod";

// ADMIN EMAIL SCHEMA
export const adminEmailSchema = z.object({
  email: z.email({ message: "Enter a valid admin email" }),
});

export type AdminEmailInput = z.infer<typeof adminEmailSchema>;

// ADMIN OTP SCHEMA
export const adminOtpSchema = z.object({
  email: z.email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
  otpReference: z.string(),
});

export type AdminOtpInput = z.infer<typeof adminOtpSchema>;

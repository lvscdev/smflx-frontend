import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.email({ message: "Enter a valid email address" }),

  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

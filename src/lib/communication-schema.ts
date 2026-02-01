import { z } from "zod";

export const recipientsEnum = z.enum([
  "all",
  "campers",
  "non-campers",
  "online",
]);

export const sendNotificationSchema = z.object({
  recipients: recipientsEnum,
  title: z
    .string()
    .min(1, "Notification title is required")
    .max(50, "Maximum 50 characters"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(200, "Maximum 200 characters"),
});

export const sendEmailSchema = z.object({
  recipients: recipientsEnum,
  subject: z.string().min(1, "Email subject is required"),
  message: z.string().min(1, "Message is required"),
});

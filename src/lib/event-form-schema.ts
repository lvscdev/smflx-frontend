import { z } from "zod";

/**
 * Utility to combine date + time into a Date object
 */
function toDateTime(date: string, time?: string) {
  if (!date) return null;
  const value = time ? `${date}T${time}` : date;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Schema for editing event dates (no time)
 */
export const editEventSchema = z
  .object({
    // theme: z.string().min(3, "Theme is required"),
    theme: z
      .string()
      .min(1, "Event theme is required")
      .min(3, "Event theme must be at least 3 characters"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
  })
  .superRefine((data, ctx) => {
    const start = toDateTime(data.startDate);
    const end = toDateTime(data.endDate);

    if (!start || !end) return;

    if (end <= start) {
      ctx.addIssue({
        path: ["endDate"],
        message: "End date must be after start date",
        code: "custom",
      });
    }
  });

/**
 * Schema for creating an event (date + time aware)
 */

export const createEventSchema = z
  .object({
    // theme: z.string().min(3, "Theme is required"),
    theme: z
      .string()
      .min(1, "Event theme is required")
      .min(3, "Event theme must be at least 3 characters"),
    year: z.number().min(2000, "Enter a valid year").int(),
    // year: z.number().min(1, "Year is required").min(2000, "Enter a valid year"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    registrationOpens: z.string().min(1, "Registration date is required"),
    registrationCloses: z
      .string()
      .min(1, "Registration close date is required"),
    registrationOpensTime: z.string().min(1, "Registration time is required"),
    registrationClosesTime: z
      .string()
      .min(1, "Registration close time is required"),
    description: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const registration = toDateTime(
      data.registrationOpens,
      data.registrationOpensTime
    );
    const start = toDateTime(data.startDate);
    const end = toDateTime(data.endDate);

    if (!registration || !start || !end) return;

    if (registration >= start) {
      ctx.addIssue({
        path: ["registrationOpens"],
        message: "Registration must open before the event starts",
        code: "custom",
      });
    }

    if (end <= start) {
      ctx.addIssue({
        path: ["endDate"],
        message: "End date must be after start date",
        code: "custom",
      });
    }
  });

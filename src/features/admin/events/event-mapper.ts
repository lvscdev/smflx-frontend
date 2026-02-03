import { z } from "zod";
import { createEventSchema } from "./event-form-schema";

/**
 * Reuse the same util you already have
 */
function toDateTime(date: string, time?: string) {
  const value = time ? `${date}T${time}` : date;
  const d = new Date(value);
  return d.toISOString();
}

export function mapCreateEventFormToApi(
  values: z.infer<typeof createEventSchema>,
) {
  return {
    eventName: values.eventName,
    eventYear: String(values.year),

    startDate: toDateTime(values.startDate),
    endDate: toDateTime(values.endDate),

    registrationOpenAt: toDateTime(
      values.registrationOpens,
      values.registrationOpensTime,
    ),
    registrationCloseAt: toDateTime(
      values.registrationCloses,
      values.registrationClosesTime,
    ),

    // backend-required fields
    eventStatus: values.status,
    accommodationNeeded: values.accommodationNeeded,
  };
}

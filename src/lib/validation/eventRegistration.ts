export interface EventRegistrationData {
  attendeeType: string;
  accommodationType: string;
}

export type ValidationResult = { ok: true } | { ok: false; message: string };

export function validateEventRegistration(data: EventRegistrationData): ValidationResult {
  if (!data.attendeeType) {
    return { ok: false, message: 'Please select an attendee type to continue.' };
  }

  if (data.attendeeType === 'camper' && !data.accommodationType) {
    return { ok: false, message: 'Please select an accommodation type to continue.' };
  }

  return { ok: true };
}

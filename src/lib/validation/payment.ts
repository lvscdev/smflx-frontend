export type ValidationResult = { ok: true } | { ok: false; message: string };

export interface PaymentContext {
  amount: number;
  userId?: string;
  eventId?: string;
}

export function validatePaymentContext(ctx: PaymentContext): ValidationResult {
  if (!ctx.amount || ctx.amount <= 0) {
    return { ok: false, message: 'Payment amount is missing. Please go back and try again.' };
  }
  if (!ctx.userId) {
    return { ok: false, message: 'We could not identify your account for payment. Please verify again.' };
  }
  if (!ctx.eventId) {
    return { ok: false, message: 'We could not identify the selected event. Please go back and select the event again.' };
  }
  return { ok: true };
}

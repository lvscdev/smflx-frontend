export function normalizeDialCode(code: string | undefined, fallback = "+234") {
  const c = (code || "").trim();
  if (!c) return fallback;
  // Ensure it starts with +
  if (c.startsWith("+")) return c;
  if (/^\d{1,4}$/.test(c)) return `+${c}`;
  return fallback;
}

export function digitsOnly(input: string) {
  return (input || "").replace(/\D+/g, "");
}

export function maxLocalPhoneLength(dialCode: string) {
  const codeDigits = digitsOnly(dialCode);
  // E.164 max 15 digits total
  const max = 15 - codeDigits.length;
  // Keep a sane minimum in case dial code is weird
  return Math.max(4, max);
}

export function sanitizeLocalPhone(local: string, dialCode: string) {
  const maxLen = maxLocalPhoneLength(dialCode);
  return digitsOnly(local).slice(0, maxLen);
}

export function buildE164Phone(dialCode: string, local: string) {
  const code = normalizeDialCode(dialCode);
  const loc = sanitizeLocalPhone(local, code);
  return (code + loc).replace(/\s+/g, "");
}

export function validateProfileBasics(input: {
  firstName?: string;
  lastName?: string;
  gender?: string;
  phoneCountryCode?: string;
  phoneNumber?: string;
}) {
  const firstName = (input.firstName || "").trim();
  const lastName = (input.lastName || "").trim();
  const gender = (input.gender || "").trim();
  const code = normalizeDialCode(input.phoneCountryCode);
  const local = sanitizeLocalPhone(input.phoneNumber || "", code);
  const full = buildE164Phone(code, local);

  if (!firstName || firstName.length < 2) return { ok: false as const, message: "Please enter your first name." };
  if (!lastName || lastName.length < 2) return { ok: false as const, message: "Please enter your last name." };
  if (!gender) return { ok: false as const, message: "Please select your gender." };

  if (!/^\+\d{1,4}$/.test(code)) return { ok: false as const, message: "Please select a valid country code." };
  if (!local) return { ok: false as const, message: "Please enter your phone number." };
  if (local.length < 7) return { ok: false as const, message: "Please enter a valid phone number." };
  if (digitsOnly(full).length > 15) return { ok: false as const, message: "Please enter a valid phone number." };

  return {
    ok: true as const,
    normalized: { firstName, lastName, gender, phoneCountryCode: code, phoneNumber: local, phoneFull: full },
  };
}

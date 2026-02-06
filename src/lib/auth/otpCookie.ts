export const OTP_COOKIE_NAME = "smflx_otp_v1";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

type OtpCookiePayload = {
  email: string;
  issuedAt: number; // epoch ms
};

function encode(payload: OtpCookiePayload) {
  return btoa(JSON.stringify(payload));
}

function decode(value: string): OtpCookiePayload | null {
  try {
    return JSON.parse(atob(value));
  } catch {
    return null;
  }
}

export function setOtpCookie(email: string) {
  if (typeof document === "undefined") return;

  const payload: OtpCookiePayload = { email, issuedAt: Date.now() };
  const val = encode(payload);

  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${OTP_COOKIE_NAME}=${val}; Max-Age=${MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
}

export function clearOtpCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${OTP_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
}

export function readOtpCookie(): OtpCookiePayload | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";").map((c) => c.trim());
  const found = cookies.find((c) => c.startsWith(`${OTP_COOKIE_NAME}=`));
  if (!found) return null;

  const value = found.slice(`${OTP_COOKIE_NAME}=`.length);
  const decoded = decode(value);
  if (!decoded?.email || !decoded?.issuedAt) return null;

  const ageMs = Date.now() - decoded.issuedAt;
  if (ageMs > 7 * 24 * 60 * 60 * 1000) return null;

  return decoded;
}

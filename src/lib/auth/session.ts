"use client";

const TOKEN_COOKIE = "smflx_token";
const LAST_STATE_KEY = "smflx_last_state";

export function setTokenCookie(token: string, days = 7) {
  const maxAge = days * 24 * 60 * 60;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

export function getTokenCookie(): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${TOKEN_COOKIE}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=")[1] || "");
}

export function clearTokenCookie() {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${TOKEN_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
}

export function saveLastState(state: any) {
  try {
    localStorage.setItem(LAST_STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function loadLastState<T = any>(): T | null {
  try {
    const raw = localStorage.getItem(LAST_STATE_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function clearLastState() {
  try {
    localStorage.removeItem(LAST_STATE_KEY);
  } catch {
    // ignore
  }
}


const ACTIVE_EVENT_COOKIE = "smflx_active_event";

export function setActiveEventCookie(eventId: string, days = 7) {
  const maxAge = days * 24 * 60 * 60;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ACTIVE_EVENT_COOKIE}=${encodeURIComponent(
    eventId,
  )}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

export function getActiveEventCookie(): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${ACTIVE_EVENT_COOKIE}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=")[1] || "");
}

export function clearActiveEventCookie() {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ACTIVE_EVENT_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
}

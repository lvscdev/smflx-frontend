export const DEFAULT_API_BASE_URL = (() => {
  const env = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!env || env === "/api" || env.endsWith("/api")) {
    return "https://loveseal-events-backend.onrender.com/";
  }

  return env.replace(/\/$/, "");
})();

export type ApiEnvelope<T> = {
  code?: string;
  message?: string;
  data?: T;
};

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;

  constructor(message: string, opts?: { status?: number; code?: string; details?: any }) {
    super(message);
    this.name = "ApiError";
    this.status = opts?.status;
    this.code = opts?.code;
    this.details = opts?.details;
  }
}

export const AUTH_TOKEN_STORAGE_KEY = "smflx_token";
export const AUTH_USER_STORAGE_KEY = "smflx_user";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=")[1] || "");
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const t = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (t) return t;
  } catch {
    // ignore
  }

  return readCookie(AUTH_TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (!token) localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    else localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } catch {
    // ignore
  }
}

export function getStoredUser<T = any>(): T | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: any | null) {
  if (typeof window === "undefined") return;

  try {
    if (!user) localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    else localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

function normalizeToken(raw: string): string {
  return raw.trim().replace(/^bearer\s+/i, "");
}

export async function apiRequest<T>(
  path: string,
  opts?: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    baseUrl?: string;
    auth?: boolean;
  }
): Promise<T> {
  const baseUrl = (opts?.baseUrl || DEFAULT_API_BASE_URL).replace(/\/$/, "");
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const method = (opts?.method || "GET").toUpperCase();

  const headers: Record<string, string> = {
    ...(opts?.headers || {}),
  };

  const hasBody = opts?.body != null && method !== "GET" && method !== "HEAD";
  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }

  const auth = opts?.auth !== false; // default true
  const token = auth ? getAuthToken() : null;
  const rawToken = token ? normalizeToken(token) : null;

  if (auth && rawToken) {
    headers["Authorization"] = `Bearer ${rawToken}`;
  }

  const doFetch = async (h: Record<string, string>) => {
    return fetch(url, {
      method,
      headers: h,
      body: hasBody ? JSON.stringify(opts!.body) : undefined,
    });
  };

  let res = await doFetch(headers);

  if (res.status === 401 && auth && rawToken) {
    const retryHeaders: Record<string, string> = { ...(opts?.headers || {}) };

    if (hasBody) retryHeaders["Content-Type"] = "application/json";

    retryHeaders["Authorization"] = rawToken;

    res = await doFetch(retryHeaders);
  }

  let json: ApiEnvelope<T> | any = null;
  try {
    json = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok) {
    const msg = json?.message || json?.error || `Request failed (${res.status})`;
    throw new ApiError(msg, { status: res.status, code: json?.code, details: json });
  }

  if (json && typeof json === "object" && "data" in json) {
    return (json as ApiEnvelope<T>).data as T;
  }

  return json as T;
}

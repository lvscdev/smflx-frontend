/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Minimal API client for SMFLX Stage 1/2 integrations.
 *
 * - Uses NEXT_PUBLIC_API_BASE_URL when provided
 * - Falls back to Render backend base URL
 * - Attaches Bearer token from localStorage (smflx_token) when available
 */

/**
 * Default API base URL.
 *
 * IMPORTANT (dev): The Render backend does not currently return CORS headers.
 * If we call it directly from the browser (localhost -> onrender), the request
 * is blocked by the browser.
 *
 * Solution: in the browser, default to the Next.js same-origin proxy at `/api`.
 * The proxy runs server-side, so CORS does not apply.
 */
export const DEFAULT_API_BASE_URL = (() => {
  // If a public base URL is explicitly provided, respect it.
  if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;

  // Browser: use same-origin proxy.
  if (typeof window !== 'undefined') return '/api';

  // Server: fall back to the backend base URL.
  return 'https://loveseal-events-backend.onrender.com';
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
    this.name = 'ApiError';
    this.status = opts?.status;
    this.code = opts?.code;
    this.details = opts?.details;
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('smflx_token');
  } catch {
    return null;
  }
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
  const baseUrl = (opts?.baseUrl || DEFAULT_API_BASE_URL).replace(/\/$/, '');
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts?.headers || {}),
  };

  const auth = opts?.auth !== false; // default true
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: opts?.method || 'GET',
    headers,
    body: opts?.body == null ? undefined : JSON.stringify(opts.body),
  });

  let json: ApiEnvelope<T> | any = null;
  try {
    json = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok) {
    const msg =
      json?.message ||
      json?.error ||
      `Request failed (${res.status})`;
    throw new ApiError(msg, { status: res.status, code: json?.code, details: json });
  }

  // Most endpoints wrap in { code, message, data }
  if (json && typeof json === 'object' && 'data' in json) {
    return (json as ApiEnvelope<T>).data as T;
  }

  return json as T;
}

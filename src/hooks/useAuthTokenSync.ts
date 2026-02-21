"use client";

import { useEffect } from "react";
import { getAdminToken } from "@/features/admin/auth/client-actions";

/**
 * Hook to sync localStorage token to cookies and request headers
 * This allows server-actions and API routes to access the token
 */
export function useAuthTokenSync() {
  useEffect(() => {
    // Sync token to cookie on mount and when navigation happens
    const token = getAdminToken();
    if (token) {
      // Set cookie via document for server-side access
      document.cookie = `admin_session=${token}; path=/; max-age=${60 * 60 * 24}`;
    } else {
      // Clear cookie if no token
      document.cookie = "admin_session=; path=/; max-age=0";
    }
  }, []);

  // Intercept all fetch requests to add auth header
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const requestUrl =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      // Only add token for API/server-action requests
      if (
        requestUrl.includes("/api/") ||
        requestUrl.includes("/_next/") ||
        requestUrl.includes(".next/")
      ) {
        const token = getAdminToken();
        if (token) {
          const headers = new Headers(init?.headers);
          headers.set("x-admin-token", token);

          const nextInit: RequestInit = {
            ...init,
            headers,
          };

          return originalFetch(input, nextInit);
        }
      }

      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);
}

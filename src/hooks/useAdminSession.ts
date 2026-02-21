"use client";

import { useAuthContext } from "@/features/admin/auth/auth-context";

/**
 * Hook to access admin session data
 * Must be used within AuthProvider
 */
export function useAdminSession() {
  const { session } = useAuthContext();
  return session;
}

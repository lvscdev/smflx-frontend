"use client";

import { getAdminToken } from "@/features/admin/auth/client-actions";

/**
 * Wrapper to automatically inject auth token from localStorage
 * for client -> server action calls
 */
export async function withAuthToken<T extends any[], R>(
  serverAction: (token: string, ...args: T) => Promise<R>,
  ...args: T
): Promise<R> {
  const token = getAdminToken();
  if (!token) {
    throw new Error("No authentication token found. Please login.");
  }
  return serverAction(token, ...args);
}

"use client";

import { useEffect, useState } from "react";
import { AdminSessionResponse } from "@/features/admin/auth/types";
import { assertAdminSession } from "@/features/admin/auth/server-actions";

export function useAdminSession() {
  const [session, setSession] = useState<AdminSessionResponse | null>(null);

  useEffect(() => {
    async function fetchSession() {
      const data = await assertAdminSession();
      setSession(data);
    }

    fetchSession();
  }, []);

  return session;
}

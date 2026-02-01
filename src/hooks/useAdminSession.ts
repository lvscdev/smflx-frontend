"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { validateAdminSession } from "@/features/admin/auth/actions";

export function useAdminSession() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        await validateAdminSession();
      } catch {
        // ❌ Session invalid → clear cookie
        document.cookie = "admin_session=; Max-Age=0; path=/";

        router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, [pathname, router]);

  return { loading };
}

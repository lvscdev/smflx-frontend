/**
 * This route intentionally redirects to the main flow page.
 *
 * The real Dashboard component is rendered by the main flow orchestrator
 * at src/app/(front-office)/page.tsx once the user reaches the "dashboard"
 * view state. Navigating directly to /dashboard would bypass all session
 * context, so we send users back to "/" where the flow resumes correctly.
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return null;
}
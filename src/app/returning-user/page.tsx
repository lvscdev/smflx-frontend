"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ReturningUserLogin } from "@/components/front-office/ui/ReturningUserLogin";

function ReturningUserInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") ?? undefined;

  return (
    <ReturningUserLogin
      initialEmail={email}
      onLoginSuccess={() => {
        router.push("/dashboard");
      }}
      onCancel={() => {
        router.push("/register");
      }}
    />
  );
}

export default function ReturningUserPage() {
  return (
    <Suspense fallback={null}>
      <ReturningUserInner />
    </Suspense>
  );
}

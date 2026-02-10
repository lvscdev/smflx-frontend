"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/front-office/ui/Sidebar";
import { ReturningUserLogin } from "@/components/front-office/ui/ReturningUserLogin";

function ReturningUserInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") ?? undefined;

  const steps = [
    {
      id: 1,
      title: "Login",
      description: "Enter your email and verification code",
      completed: false,
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full">
      <Sidebar
        currentStep={0}
        steps={steps}
        onAlreadyRegistered={() => router.push("/register")}
      />

      <div className="flex-1 min-h-0 flex flex-col overflow-y-auto bg-white">
        <ReturningUserLogin
          initialEmail={email}
          onLoginSuccess={() => {
            router.push("/dashboard");
          }}
          onCancel={() => {
            router.push("/register");
          }}
        />
      </div>
    </div>
  );
}

export default function ReturningUserPage() {
  return (
    <Suspense fallback={null}>
      <ReturningUserInner />
    </Suspense>
  );
}

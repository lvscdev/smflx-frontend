"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ReturningUserLogin } from "@/components/front-office/ui/ReturningUserLogin";
import { Sidebar } from "@/components/front-office/ui/Sidebar";

function ReturningUserInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") ?? undefined;

  // Simple steps for login page
  const loginSteps = [
    { id: 1, title: "Login", description: "Verify your email", completed: false },
    { id: 2, title: "Dashboard", description: "Access your account", completed: false },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full">
      {/* Add Sidebar for consistency with registration flow */}
      <Sidebar
        currentStep={1}
        steps={loginSteps}
        onAlreadyRegistered={() => {
          router.push("/register");
        }}
        hostelSpacesLeft={undefined}
      />
      
      {/* Login form */}
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
  );
}

export default function ReturningUserPage() {
  return (
    <Suspense fallback={null}>
      <ReturningUserInner />
    </Suspense>
  );
}
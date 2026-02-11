"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const FLOW_STATE_KEY = "smflx_flow_state_v1";
const PENDING_CTX_KEY = "smflx_pending_payment_ctx";

export type PaymentProps = {
  amount: number;
  eventId?: string; 
  userId?: string;
  registrationId?: string;
  email: string;
  profile?: any;
  registration?: any;
  accommodation?: any;
  onBack: () => void;
  onComplete: () => void;
};


function safeLoadFlowState(): Record<string, any> | null {
  try {
    const raw = localStorage.getItem(FLOW_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function safeSaveFlowState(state: Record<string, any>) {
  try {
    localStorage.setItem(FLOW_STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function clearPendingCtx() {
  try {
    localStorage.removeItem(PENDING_CTX_KEY);
  } catch {
    // ignore
  }
}

type CallbackStatus = "loading" | "success" | "failed";

function PaymentCallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>("loading");

  useEffect(() => {
    // Korapay may use "status" or "payment_status"; normalise.
    const rawStatus = (
      params.get("status") ||
      params.get("payment_status") ||
      ""
    ).toLowerCase();

    if (rawStatus === "success") {
      // --- mark payment successful in flow state ---
      const flow = safeLoadFlowState();
      if (flow) {
        flow.view = "dashboard";
        flow.paymentStatus = "success";
        // If there was a pending payment context (accommodation or dependents)
        // it is now fulfilled — clear it.
        safeSaveFlowState(flow);
      }
      clearPendingCtx();
      setStatus("success");

      // Auto-navigate after a brief moment so the user sees the tick.
      const timer = setTimeout(() => router.replace("/"), 1800);
      return () => clearTimeout(timer);
    }

    if (rawStatus === "failed") {
      setStatus("failed");
      // Do NOT clear pending ctx — user may retry.
      return;
    }

    // Unknown / missing status — treat as pending/ambiguous.
    // The webhook will sort things out server-side; just send the user
    // to the dashboard where they can see their actual state.
    const flow = safeLoadFlowState();
    if (flow) {
      flow.view = "dashboard";
      safeSaveFlowState(flow);
    }
    clearPendingCtx();
    setStatus("success"); // optimistic — webhook is the source of truth
    const timer = setTimeout(() => router.replace("/"), 1800);
    return () => clearTimeout(timer);
  }, [params, router]);

  // ---------- UI ----------

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-lg p-10 max-w-sm w-full text-center">
          <Loader2 className="w-12 h-12 animate-spin text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Processing payment…
          </h2>
          <p className="text-sm text-gray-500">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-lg p-10 max-w-sm w-full text-center">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Payment successful
          </h2>
          <p className="text-sm text-gray-500">
            You'll be taken to your dashboard in a moment…
          </p>
        </div>
      </div>
    );
  }

  // status === "failed"
  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg p-10 max-w-sm w-full text-center">
        <XCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Payment failed
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Your payment was not completed. No money has been charged. You can
          try again from your dashboard.
        </p>
        <button
          onClick={() => router.replace("/dashboard")}
          className="w-full py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-lg p-10 max-w-sm w-full text-center">
            <Loader2 className="w-12 h-12 animate-spin text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Loading…
            </h2>
            <p className="text-sm text-gray-500">Preparing payment status.</p>
          </div>
        </div>
      }
    >
      <PaymentCallbackInner />
    </Suspense>
  );
}

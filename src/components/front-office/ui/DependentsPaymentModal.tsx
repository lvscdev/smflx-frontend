'use client';

import type { Dependent } from "./DependentsModal";
import { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { InlineAlert } from './InlineAlert';
import { initiateDependentPayment, payForAllDependants } from '@/lib/api';
import { toUserMessage } from '@/lib/errors';

interface DependentsPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  dependents: Dependent[];
  onPaymentComplete: () => void;
  eventId?: string;
  parentRegId?: string;
}

export function DependentsPaymentModal({
  isOpen,
  onClose,
  dependents,
  eventId,
  parentRegId,
  onPaymentComplete,
}: DependentsPaymentModalProps) {
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);



  if (!isOpen) return null;

  const DEPENDENT_PRICE = Number(process.env.NEXT_PUBLIC_DEPENDENT_PRICE) || 7000;
  const totalAmount = dependents.length * DEPENDENT_PRICE;

  const startPayment = async () => {
    setError(null);
    setPaymentProcessing(true);

    try {
      const resolvedParentRegId = parentRegId;

const reference =
  (typeof crypto !== "undefined" && "randomUUID" in crypto)
    ? (crypto as any).randomUUID()
    : `smflx_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const origin = window.location.origin;
const notification_url = `${origin}/api/billing/verify`;
const redirect_url = `${origin}/payment`; 


      console.log("💳 Starting dependent payment:", {
        parentRegId: resolvedParentRegId,
        dependents: dependents.map(d => ({ id: d.id, name: d.name })),
        totalAmount
      });

      if (!resolvedParentRegId) {
        console.error("❌ Missing parentRegId for payment!");
        throw new Error("Missing parentRegId (owner regId). Please refresh your dashboard and try again.");
      }

const dependentIds = (dependents || []).map((d) => d?.id).filter(Boolean) as string[];

if (dependentIds.length === 0) {
  throw new Error("Missing dependent ID. Please refresh and try again.");
}

const resp =
  dependentIds.length > 1
    ? await payForAllDependants({
        parentRegId: resolvedParentRegId,
        reference,
        notification_url,
        redirect_url,
      })
    : await initiateDependentPayment({
        dependantId: dependentIds[0]!,
        parentRegId: resolvedParentRegId,
        reference,
        notification_url,
        redirect_url,
      });

      console.log("🟢 Payment API response:", resp);

      const checkoutUrl =
        resp?.checkoutUrl ||
        resp?.data?.checkoutUrl ||
        resp?.paymentUrl ||
        resp?.data?.paymentUrl;

      if (!checkoutUrl) {
        console.error("❌ No checkout URL in response:", resp);
        throw new Error(
          "Payment initiation succeeded but checkoutUrl was not returned."
        );
      }

      console.log("✅ Redirecting to checkout:", checkoutUrl);

      try {
        localStorage.setItem(
          "smflx_pending_payment_ctx",
          JSON.stringify({
            type: "dependents",
            parentRegId: resolvedParentRegId,
            dependentIds,
            reference,
            startedAt: new Date().toISOString(),
          })
        );

      } catch {
        // ignore
      }

      window.location.href = checkoutUrl;
    } catch (err: unknown) {
      console.error("❌ Payment error:", err);
      setError(toUserMessage(err, { feature: "payment", action: "init" }));
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentProcessing) return;
    await startPayment();
  };




  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-semibold">Payment for Dependents</h2>
            <p className="text-sm text-gray-600 mt-1">
              Register {dependents.length} dependent{dependents.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={paymentProcessing}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors shrink-0 disabled:opacity-60"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold mb-3">Registering:</h3>
            <div className="space-y-2">
              {dependents.map((dependent, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{dependent.name}</span>
                  <span className="text-gray-600">₦{DEPENDENT_PRICE.toLocaleString('en-NG')}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
              <span className="font-semibold">Total Amount</span>
              <span className="text-2xl font-bold">₦{totalAmount.toLocaleString('en-NG')}</span>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
            You’ll complete payment on the secure checkout page after you click <span className="font-medium">Proceed to Checkout</span>.
          </div>

          {error && (
            <InlineAlert
              variant="error"
              title="Payment couldn’t start"
              actionLabel="Try again"
              onAction={() => {
                if (!paymentProcessing) void startPayment();
              }}
              className="mb-6"
            >
              {error}
            </InlineAlert>
          )}


          <form onSubmit={handlePayment} className="space-y-6">
            <button
              type="submit"
              disabled={paymentProcessing}
              className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                paymentProcessing
                  ? 'bg-gray-300 text-gray-600 cursor-wait'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              {paymentProcessing
                ? 'Redirecting to checkout…'
                : dependents.length > 1
                ? `Pay for All Dependents (₦${totalAmount.toLocaleString('en-NG')})`
                : `Pay for Dependent (₦${totalAmount.toLocaleString('en-NG')})`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
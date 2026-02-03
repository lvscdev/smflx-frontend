'use client';

import { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { InlineAlert } from './InlineAlert';
import { initiateRegistrationPayment } from '@/lib/api';
import { toUserMessage } from '@/lib/errors';

interface DependentsPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  dependents: any[];
  onPaymentComplete: () => void;
  eventId?: string;
}

/**
 * Stage 3 requirement:
 * - Initiate checkout and redirect in the SAME TAB using checkoutUrl.
 * - No demo simulations / fallbacks.
 */
export function DependentsPaymentModal({
  isOpen,
  onClose,
  dependents,
  eventId,
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
      const raw = typeof window !== 'undefined' ? localStorage.getItem('smflx_user') : null;
      const user = raw ? JSON.parse(raw) : null;
      const userId = user?.userId;

      const resolvedEventId =
        eventId ||
        dependents?.[0]?.eventId ||
        dependents?.[0]?.event?.eventId;

      if (!userId || !resolvedEventId) {
        throw new Error('Missing user/event context for payment checkout.');
      }

      // Generate a unique reference for this transaction
      const reference = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? crypto.randomUUID()
        : `smflx_dep_${Date.now()}_${Math.random().toString(16).slice(2)}`;

      const origin = window.location.origin;

      // Use /accommodation/initialize — the only payment-init endpoint in the
      // backend.  reason + narration (optional in the schema) tell the backend
      // this is a dependents payment so it can record it correctly.
      const resp = await initiateRegistrationPayment({
        amount: totalAmount,
        userId,
        eventId: resolvedEventId,
        reference,
        reason: 'dependents_registration',
        narration: `Registration payment for ${dependents.length} dependent(s)`,
        notification_url: `${origin}/api/billing/verify`,
        redirect_url: `${origin}/payment/callback`,
      });

      const checkoutUrl = resp?.checkoutUrl;
      if (!checkoutUrl) throw new Error('Payment initiation succeeded but checkoutUrl was not returned.');

      // Persist context so the callback page knows this was a dependents payment
      try {
        localStorage.setItem(
          'smflx_pending_payment_ctx',
          JSON.stringify({
            type: 'dependents',
            dependentIds: (dependents || [])
              .map((d: any) => d?.dependentId || d?.id || d?.dependentRegistrationId)
              .filter(Boolean),
            amount: totalAmount,
            startedAt: new Date().toISOString(),
          })
        );
      } catch {
        // ignore storage failures
      }

      window.location.href = checkoutUrl;
    } catch (err: any) {
      setError(toUserMessage(err, { feature: 'payment', action: 'init' }));
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
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-60"
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
              {paymentProcessing ? 'Redirecting to checkout…' : `Proceed to Checkout (₦${totalAmount.toLocaleString('en-NG')})`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
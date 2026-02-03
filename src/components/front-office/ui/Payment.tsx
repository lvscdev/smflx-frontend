'use client';

import { useState } from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { InlineAlert } from './InlineAlert';
import { initiateRegistrationPayment } from '@/lib/api';
import { toUserMessage } from '@/lib/errors';
import { validatePaymentContext } from '@/lib/validation/payment';

interface PaymentProps {
  amount: number;
  onComplete?: () => void;
  onBack: () => void;
  profile?: any;
  accommodation?: any;
  registration?: any;
}

export function Payment({ amount, onBack, profile, accommodation, registration }: PaymentProps) {
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async () => {
    setError(null);
    setPaymentProcessing(true);

    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('smflx_user') : null;
      const user = raw ? JSON.parse(raw) : null;

      const userId = profile?.userId || user?.userId;
      const eventId = registration?.eventId;

      const ctxRes = validatePaymentContext({ amount, userId, eventId });
      if (!ctxRes.ok) {
        throw new Error(ctxRes.message);
      }

      const reference = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? crypto.randomUUID()
        : `smflx_${Date.now()}_${Math.random().toString(16).slice(2)}`;

      // Derive the absolute origin so Korapay can redirect back and
      // so the backend can forward notification_url to Korapay.
      const origin = window.location.origin; // e.g. https://smflx.vercel.app

      const resp = await initiateRegistrationPayment({
        amount,
        userId,
        eventId,
        reference,
        // Korapay needs these forwarded by the backend when it calls
        // the Korapay initialise charge API (Checkout Standard).
        notification_url: `${origin}/api/billing/verify`,
        redirect_url: `${origin}/payment/callback`,
      });

      const checkoutUrl = resp?.checkoutUrl;
      if (!checkoutUrl) {
        throw new Error('Payment initiation succeeded but checkoutUrl was not returned.');
      }

      // Persist enough context to resume deterministically on return from checkout.
      try {
        localStorage.setItem(
          'smflx_pending_payment_ctx',
          JSON.stringify({
            profile: profile || null,
            registration: registration || null,
            accommodation: accommodation || null,
            amount,
            startedAt: new Date().toISOString(),
          })
        );
      } catch {
        // ignore storage failures
      }

      // ✅ SAME TAB redirect
      window.location.href = checkoutUrl;
    } catch (err: any) {
      setError(toUserMessage(err, { feature: 'payment', action: 'init' }));
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentProcessing) return;
    await startCheckout();
  };

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl mb-2">Payment</h1>
          <p className="text-gray-600 text-sm">You’ll be redirected to a secure checkout to complete payment.</p>
        </div>

        <div className="mb-6 p-6 bg-gray-50 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Amount Due</span>
            <span className="text-3xl">₦{amount.toLocaleString('en-NG')}</span>
          </div>
        </div>

        {error && (
          <InlineAlert
            variant="error"
            title="Payment couldn’t start"
            actionLabel="Try again"
            onAction={() => {
              if (!paymentProcessing) void startCheckout();
            }}
            className="mb-6"
          >
            {error}
          </InlineAlert>
        )}

        <form onSubmit={handleCheckout} className="space-y-4">
          <button
            type="submit"
            disabled={paymentProcessing || !amount}
            className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              !amount
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : paymentProcessing
                  ? 'bg-gray-300 text-gray-600 cursor-wait'
                  : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            {paymentProcessing ? 'Redirecting to checkout…' : 'Proceed to Checkout'}
          </button>

          <button
            type="button"
            onClick={onBack}
            disabled={paymentProcessing}
            className="w-full py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </form>
      </div>
    </div>
  );
}
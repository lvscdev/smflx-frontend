'use client';

import { useState } from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { initiateRegistrationPayment } from '@/lib/api';

interface PaymentProps {
  amount: number;
  onComplete: () => void;
  onBack: () => void;
  profile?: any;
  accommodation?: any;
  registration?: any;
}

export function Payment({ amount, onBack, profile, accommodation, registration }: PaymentProps) {
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPaymentProcessing(true);

    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('smflx_user') : null;
      const user = raw ? JSON.parse(raw) : null;

      const userId = profile?.userId || user?.userId;
      const eventId = registration?.eventId;
      const registrationId = registration?.registrationId;

      if (!userId || !eventId) {
        throw new Error('Missing user/event context for payment checkout.');
      }

            const reference = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? crypto.randomUUID()
        : `smflx_${Date.now()}_${Math.random().toString(16).slice(2)}`;

      const resp = await initiateRegistrationPayment({
        amount,
        userId,
        eventId,
        reference,
      });

      const checkoutUrl = resp?.checkoutUrl;
      if (!checkoutUrl) {
        throw new Error('Payment initiation succeeded but checkoutUrl was not returned.');
      }

      // Persist enough context to resume deterministically on return from checkout.
      // (Does not change flow order; only prevents "back to verify" on return.)
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
      setError(err?.message || 'Unable to start payment checkout. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
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
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">
            {error}
          </div>
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

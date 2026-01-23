'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, CircleCheck, ArrowLeft, Copy, Check } from 'lucide-react';

interface PaymentProps {
  amount: number;
  onComplete: () => void;
  onBack: () => void;
  profile?: any;
  accommodation?: any;
}

export function Payment({ amount, onComplete, onBack, profile, accommodation }: PaymentProps) {
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [copied, setCopied] = useState(false);

  const generatePairingCode = () => {
    // Generate a random 5-digit code
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentComplete(true);
      
      // Generate and store pairing code for married hotel guests
      let generatedCode = '';
      if (profile?.maritalStatus === 'married' && accommodation?.type === 'hotel') {
        generatedCode = generatePairingCode();
        setPairingCode(generatedCode);
        localStorage.setItem('hotel_pairing_code', generatedCode);
      }
      
      // Navigate to dashboard after showing success
      setTimeout(() => {
        onComplete();
      }, generatedCode ? 4000 : 2000); // Give more time to copy code if present
    }, 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pairingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFormValid = () => {
    return cardNumber.length === 19 && expiryDate.length === 5 && cvv.length === 3 && cardName.trim();
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  if (paymentComplete) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CircleCheck className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-xl lg:text-2xl mb-2">Payment Successful!</h2>
          <p className="text-gray-600 text-sm mb-4">
            Your registration is now confirmed. Redirecting to dashboard...
          </p>
          {pairingCode && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-gray-700 font-medium text-sm mb-3">Share this code with your spouse:</p>
              <div className="flex items-center justify-center gap-3">
                <div className="bg-white px-6 py-3 rounded-lg border-2 border-blue-200">
                  <span className="text-3xl font-bold text-gray-900 tracking-wider">{pairingCode}</span>
                </div>
                <button
                  onClick={copyToClipboard}
                  className={`p-3 rounded-lg transition-colors ${
                    copied ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Your spouse can use this code to skip payment
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl mb-2">Payment</h1>
          <p className="text-gray-600 text-sm">
            Complete your registration by making a payment
          </p>
        </div>

        <div className="mb-6 p-6 bg-gray-50 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Amount Due</span>
            <span className="text-3xl">₦{amount.toLocaleString('en-NG')}</span>
          </div>
        </div>

        <form onSubmit={handlePayment} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="cardName" className="block text-sm text-gray-700">Cardholder Name *</label>
            <input
              id="cardName"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="cardNumber" className="block text-sm text-gray-700">Card Number *</label>
            <div className="relative">
              <input
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 pr-12 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                maxLength={19}
              />
              <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="expiryDate" className="block text-sm text-gray-700">Expiry Date *</label>
              <input
                id="expiryDate"
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                placeholder="MM/YY"
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="cvv" className="block text-sm text-gray-700">CVV *</label>
              <input
                id="cvv"
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="123"
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                maxLength={3}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="submit"
              disabled={!isFormValid() || paymentProcessing}
              className={`flex-1 py-3 rounded-lg transition-colors ${
                isFormValid() && !paymentProcessing
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {paymentProcessing ? 'Processing Payment...' : `Pay ₦${amount.toLocaleString('en-NG')}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
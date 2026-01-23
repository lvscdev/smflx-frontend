"use client";

import { useState } from 'react';
import { X, CreditCard, CircleCheck } from 'lucide-react';

interface DependentsPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  dependents: any[];
  onPaymentComplete: () => void;
}

export function DependentsPaymentModal({ 
  isOpen, 
  onClose, 
  dependents, 
  onPaymentComplete 
}: DependentsPaymentModalProps) {
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  if (!isOpen) return null;

  const totalAmount = dependents.length * 7000;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentComplete(true);
      
      // Complete after showing success
      setTimeout(() => {
        onPaymentComplete();
        onClose();
      }, 2000);
    }, 2000);
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CircleCheck className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Payment Successful!</h2>
            <p className="text-gray-600 text-sm">
              Your dependents have been registered successfully.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          {/* Dependents Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold mb-3">Registering:</h3>
            <div className="space-y-2">
              {dependents.map((dependent, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{dependent.name}</span>
                  <span className="text-gray-600">₦7,000</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
              <span className="font-semibold">Total Amount</span>
              <span className="text-2xl font-bold">₦{totalAmount.toLocaleString('en-NG')}</span>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handlePayment} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="cardName" className="block text-sm text-gray-700 font-medium">
                Cardholder Name *
              </label>
              <input
                id="cardName"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="cardNumber" className="block text-sm text-gray-700 font-medium">
                Card Number *
              </label>
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
                <label htmlFor="expiryDate" className="block text-sm text-gray-700 font-medium">
                  Expiry Date *
                </label>
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
                <label htmlFor="cvv" className="block text-sm text-gray-700 font-medium">
                  CVV *
                </label>
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

            <button
              type="submit"
              disabled={!isFormValid() || paymentProcessing}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                isFormValid() && !paymentProcessing
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {paymentProcessing ? 'Processing Payment...' : `Pay ₦${totalAmount.toLocaleString('en-NG')}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

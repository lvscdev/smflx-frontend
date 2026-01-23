"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PairingCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToPayment: () => void;
  onCodeVerified: () => void;
}

export function PairingCodeModal({ isOpen, onClose, onProceedToPayment, onCodeVerified }: PairingCodeModalProps) {
  const [pairingCode, setPairingCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  if (!isOpen) return null;

  const handleVerifyCode = () => {
    if (!pairingCode.trim()) {
      setVerificationError('Please enter a pairing code');
      return;
    }

    if (pairingCode.length !== 5 || !/^\d+$/.test(pairingCode)) {
      setVerificationError('Please enter a valid 5-digit code');
      return;
    }

    setIsVerifying(true);
    setVerificationError('');

    // Simulate code verification - accept any 5-digit code
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationSuccess(true);
      
      // Proceed to dashboard after showing success
      setTimeout(() => {
        onCodeVerified();
      }, 1500);
    }, 1000);
  };

  if (verificationSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Approved!</h2>
            <p className="text-gray-600">
              Your pairing code has been verified. Proceeding to dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Hotel Pairing</h2>
          <p className="text-gray-600 text-sm">
            If your spouse has already paid for hotel accommodation, enter their pairing code to continue.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-700 font-medium mb-2">
              Enter Pairing Code
            </label>
            <Input
              type="text"
              value={pairingCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                setPairingCode(value);
                setVerificationError('');
              }}
              placeholder="12345"
              className="w-full text-center text-lg tracking-widest"
              disabled={isVerifying}
              maxLength={5}
            />
            {verificationError && (
              <p className="text-red-600 text-sm mt-2">{verificationError}</p>
            )}
          </div>

          <button
            onClick={handleVerifyCode}
            disabled={isVerifying || !pairingCode.trim()}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              isVerifying || !pairingCode.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isVerifying ? 'Verifying...' : 'Verify Code'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Don&apos;t have a code?</span>
            </div>
          </div>

          <button
            onClick={onProceedToPayment}
            className="w-full py-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
}
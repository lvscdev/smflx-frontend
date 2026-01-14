'use client';

import { useState } from 'react';

interface EmailVerificationProps {
  onVerified: (email: string) => void;
  onAlreadyRegistered: () => void;
}

export function EmailVerification({ onVerified, onAlreadyRegistered }: EmailVerificationProps) {
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const handleSendVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsVerifying(true);
      // Simulate sending verification email
      setTimeout(() => {
        setIsVerifying(false);
        setVerificationSent(true);
      }, 1000);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate verification
    if (verificationCode.length === 6) {
      onVerified(email);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white relative">
      {/* Already Registered Link */}
      <div className="absolute top-4 lg:top-8 right-4 lg:right-12">
        <button
          onClick={onAlreadyRegistered}
          className="text-xs lg:text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Already Registered? Click Here
        </button>
      </div>

      {/* Centered Content */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl mb-3">Account Verification</h1>
            <p className="text-gray-600 text-sm">
              Enter your email to access the SMFLX registration portal
            </p>
          </div>

          {!verificationSent ? (
            <form onSubmit={handleSendVerification} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm mb-2 text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              <button
                type="submit"
                disabled={!email || isVerifying}
                className={`w-full py-3 rounded-lg transition-colors ${
                  email && !isVerifying
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isVerifying ? 'Sending...' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg text-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p>Verification code sent to {email}</p>
              </div>
              <div>
                <label htmlFor="code" className="block text-sm mb-2 text-gray-700">
                  Verification Code
                </label>
                <input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-center text-xl tracking-widest"
                />
              </div>
              <button
                type="submit"
                disabled={verificationCode.length !== 6}
                className={`w-full py-3 rounded-lg transition-colors ${
                  verificationCode.length === 6
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Verify & Continue
              </button>
              <button
                type="button"
                onClick={() => setVerificationSent(false)}
                className="w-full py-3 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Change Email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
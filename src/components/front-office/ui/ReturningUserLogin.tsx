"use client";

import { useState, type FormEvent } from "react";
import { generateLoginOtp, validateOtp } from "@/lib/api";
import { AUTH_USER_STORAGE_KEY, setAuthToken } from "@/lib/api/client";

interface ReturningUserLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export function ReturningUserLogin({ onLoginSuccess, onCancel }: ReturningUserLoginProps) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [otpReference, setOtpReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendCode = async () => {
    setError("");
    const trimmed = email.trim();

    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const { reference } = await generateLoginOtp(trimmed);
      setOtpReference(reference);
      setStep("code");
    } catch (err: any) {
      setError(err?.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendCode();
  };

  const handleCodeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    if (!otpReference) {
      setError('Please resend the code and try again');
      return;
    }

    setLoading(true);
    try {
      const { token, userDetails } = await validateOtp({
        email: email.trim(),
        otp: code,
        otpReference,
      });

      setAuthToken(token);
      try {
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(userDetails));
      } catch {
        // ignore
      }

      onLoginSuccess();
    } catch (err: any) {
      setError(err?.message || 'Invalid code. Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white relative">
      {/* Centered Content */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl mb-3">Welcome Back</h1>
            <p className="text-gray-600 text-sm">
              {step === 'email'
                ? 'Enter your registered email to access your dashboard'
                : 'Enter the verification code sent to your email'}
            </p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm mb-2 text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!email || loading}
                className={`w-full py-3 rounded-lg transition-colors ${
                  email && !loading
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="underline w-full py-3 text-gray-600 hover:text-gray-900 transition-colors"
              >
                New Registration
              </button>
            </form>
          ) : (
            <form onSubmit={handleCodeSubmit} className="space-y-6">
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
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-center text-xl tracking-widest"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={code.length !== 6 || loading}
                className={`w-full py-3 rounded-lg transition-colors ${
                  code.length === 6 && !loading
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <button
                type="button"
                onClick={sendCode}
                className="underline w-full py-3 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Resend verification code
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

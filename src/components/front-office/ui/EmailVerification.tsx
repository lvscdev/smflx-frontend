"use client";

import { useEffect, useState } from "react";
import { generateRegistrantOtp, validateOtp } from "@/lib/api";
import { setOtpCookie } from "@/lib/auth/otpCookie";
import { setTokenCookie } from "@/lib/auth/session";
import { AUTH_USER_STORAGE_KEY, setAuthToken } from "@/lib/api/client";
import { toUserMessage } from "@/lib/errors";
import { InlineAlert } from "./InlineAlert";

interface EmailVerificationProps {
  onVerified: (email: string) => void;
  onAlreadyRegistered: () => void;
}

const RESEND_COOLDOWN_SECONDS = 45;

export function EmailVerification({
  onVerified,
  onAlreadyRegistered,
}: EmailVerificationProps) {
  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [otpReference, setOtpReference] = useState<string>("");

  const [error, setError] = useState("");

  // Resend cooldown
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = window.setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [resendCooldown]);

  const isValidEmail = (value: string) => {
    const v = value.trim();
    return !!v && v.includes("@");
  };

  const sendVerificationCode = async () => {
    setError("");

    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setError("Please enter a valid email address");
      return;
    }

    if (resendCooldown > 0) return;

    setIsVerifying(true);
    try {
      const { reference } = await generateRegistrantOtp(trimmed);
      setOtpReference(reference);
      // Keep a short-lived (7d) hint so dashboard landing can prefill ReturningUser
      setOtpCookie(trimmed);
      setVerificationSent(true);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err: any) {
      // ✅ FIX: Check for duplicate user error
      const isUserExists = 
        err?.status === 409 || 
        err?.code === "USER_ALREADY_EXISTS" ||
        err?.code === "EMAIL_EXISTS" ||
        err?.code === "DUPLICATE_EMAIL" ||
        (err?.message && (
          err.message.toLowerCase().includes("already registered") ||
          err.message.toLowerCase().includes("user exists") ||
          err.message.toLowerCase().includes("email exists") ||
          err.message.toLowerCase().includes("already exists")
        ));
      
      if (isUserExists) {
        // Store email for login page
        setOtpCookie(trimmed);
        
        // Show message before redirecting
        setError("This email is already registered. Redirecting to login...");
        
        // Redirect to login after brief delay
        setTimeout(() => {
          onAlreadyRegistered();
        }, 1500);
        
        setIsVerifying(false);
        return;
      }
      
      setError(toUserMessage(err, { feature: "otp", action: "send" }));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendVerificationCode();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (verificationCode.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    if (!otpReference) {
      setError("Please resend the code and try again");
      return;
    }

    setIsVerifying(true);
    try {
      const trimmed = email.trim();
      const { token, userDetails } = await validateOtp({
        email: trimmed,
        otp: verificationCode,
        otpReference,
      });

      // Persist session for Stage 2/3 API calls
      setAuthToken(token);
      setTokenCookie(token);

      try {
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(userDetails));
      } catch {
        // ignore
      }

      onVerified(trimmed);
    } catch (err: any) {
      setError(toUserMessage(err, { feature: "otp", action: "verify" }));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChangeEmail = () => {
    setVerificationSent(false);
    setVerificationCode("");
    setOtpReference("");
    setError("");
    setResendCooldown(0);
  };

  return (
    <div className="flex-1 flex flex-col bg-white relative">
      {/* Already Registered Link */}
      <div className="absolute top-4 lg:top-8 right-4 lg:right-12">
        <button
          onClick={onAlreadyRegistered}
          className="underline text-xs lg:text-sm text-gray-600 hover:text-gray-900 transition-colors"
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

          {error && (
            <InlineAlert 
              variant={error.includes("already registered") ? "info" : "error"} 
              title={error.includes("already registered") ? "Existing Account" : "Something went wrong"} 
              className="mb-4"
            >
              {error}
            </InlineAlert>
          )}

          {!verificationSent ? (
            <form onSubmit={handleSendVerification} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm mb-2 text-gray-700"
                >
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
                disabled={!isValidEmail(email) || isVerifying}
                className={`w-full py-3 rounded-lg transition-colors ${
                  isValidEmail(email) && !isVerifying
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isVerifying ? "Sending..." : "Send Verification Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg text-sm">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p>Verification code sent to {email}</p>
              </div>

              <div>
                <label
                  htmlFor="code"
                  className="block text-sm mb-2 text-gray-700"
                >
                  Verification Code
                </label>
                <input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  maxLength={6}
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-center text-xl tracking-widest"
                />
              </div>

              <button
                type="submit"
                disabled={verificationCode.length !== 6 || isVerifying}
                className={`w-full py-3 rounded-lg transition-colors ${
                  verificationCode.length === 6 && !isVerifying
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isVerifying ? "Verifying..." : "Verify & Continue"}
              </button>

              {/* ✅ Resend OTP */}
              <button
                type="button"
                onClick={sendVerificationCode}
                className="w-full text-sm text-gray-600 hover:text-gray-900 underline underline-offset-4 transition-colors disabled:no-underline disabled:text-gray-400 disabled:hover:text-gray-400"
                disabled={isVerifying || resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : "Resend verification code"}
              </button>

              <button
                type="button"
                onClick={handleChangeEmail}
                className="underline w-full py-3 text-gray-600 hover:text-gray-900 transition-colors"
                disabled={isVerifying}
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
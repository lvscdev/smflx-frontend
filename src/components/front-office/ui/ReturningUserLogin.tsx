"use client";

import { useState, type FormEvent } from "react";
import { generateLoginOtp, validateOtp } from "@/lib/api";
import { setTokenCookie } from "@/lib/auth/session";
import { AUTH_USER_STORAGE_KEY, setAuthToken } from "@/lib/api/client";
import { toUserMessage } from "@/lib/errors";
import { InlineAlert } from "./InlineAlert";

interface ReturningUserLoginProps {
  onLoginSuccess: (email?: string) => void; 
  onCancel: () => void;
}

export function ReturningUserLogin({
  onLoginSuccess,
  onCancel,
}: ReturningUserLoginProps) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [otpReference, setOtpReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setError(toUserMessage(err, { feature: "otp", action: "send" }));
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
    setError("");

    if (code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    if (!otpReference) {
      setError("Please resend the code and try again");
      return;
    }

    setLoading(true);
    try {
      const trimmed = email.trim();

      const { token, userDetails } = await validateOtp({
        email: trimmed,
        otp: code,
        otpReference,
      });

      // ✅ Persist session (localStorage + cookie)
      setAuthToken(token);
      setTokenCookie(token);

      try {
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(userDetails));
      } catch {
        // ignore
      }

      // ✅ give the email back to the parent so it can resume properly
      onLoginSuccess(trimmed);
    } catch (err: any) {
      setError(toUserMessage(err, { feature: "otp", action: "verify" }));
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
              {step === "email"
                ? "Enter your registered email to access your dashboard"
                : "Enter the verification code sent to your email"}
            </p>
          </div>

          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                  disabled={loading}
                />
              </div>

              {error && (
                <InlineAlert variant="error" title="Couldn’t continue">
                  {error}
                </InlineAlert>
              )}

              <button
                type="submit"
                className={`w-full px-6 py-3 rounded-lg transition-colors ${
                  !loading
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={loading}
              >
                {loading ? "Sending..." : "Continue"}
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="w-full px-6 py-3 text-gray-600 hover:text-gray-900 underline underline-offset-4 transition-colors"
                disabled={loading}
              >
                New Registration
              </button>
            </form>
          ) : (
            <form onSubmit={handleCodeSubmit} className="space-y-6">
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
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-center text-2xl tracking-widest"
                  disabled={loading}
                  maxLength={6}
                />
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Check your email:{" "}
                  <span className="font-medium text-gray-700">{email}</span>
                </p>
              </div>

              {error && (
                <InlineAlert variant="error" title="Couldn’t continue">
                  {error}
                </InlineAlert>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-6 py-3 rounded-lg transition-colors ${
                    !loading
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
              </div>

              <button
                type="button"
                onClick={sendCode}
                className="w-full text-sm text-gray-600 hover:text-gray-900 underline underline-offset-4 transition-colors"
                disabled={loading}
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

"use client";

import { useState } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { initiateHotelAllocation } from "@/lib/api";
import { ApiError } from "@/lib/api/client";

interface PairingCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToPayment: () => void;
  onCodeVerified: () => void;
  /** Context needed to call the hotel-allocation endpoint */
  registrationId?: string;
  eventId?: string;
  userId?: string;
  facilityId?: string;
  roomId?: string;
}

export function PairingCodeModal({
  isOpen,
  onClose,
  onProceedToPayment,
  onCodeVerified,
  registrationId = "",
  eventId = "",
  userId = "",
  facilityId = "",
  roomId = "",
}: PairingCodeModalProps) {
  const [pairingCode, setPairingCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  if (!isOpen) return null;

  // ---------------------------------------------------------------------------
  // Verify: hit the real hotel-allocation endpoint.
  // The pairing code is sent as roomTypeId — the backend resolves it to the
  // spouse's existing allocation and either accepts or rejects it.
  // ---------------------------------------------------------------------------
  const handleVerifyCode = async () => {
    if (!pairingCode.trim()) {
      setVerificationError("Please enter a pairing code");
      return;
    }

    if (pairingCode.length !== 5 || !/^\d+$/.test(pairingCode)) {
      setVerificationError("Please enter a valid 5-digit code");
      return;
    }

    setIsVerifying(true);
    setVerificationError("");

    try {
      await initiateHotelAllocation({
        registrationId,
        roomTypeId: pairingCode,   // backend uses this to look up the spouse allocation
        eventId,
        userId,
        facilityId,
      });

      // Backend accepted → show success, then fire callback after a beat
      setVerificationSuccess(true);
      setTimeout(() => {
        onCodeVerified();
      }, 1500);
    } catch (err) {
      const msg =
        err instanceof ApiError && err.message
          ? err.message
          : "Invalid or expired pairing code. Please check and try again.";
      setVerificationError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Success screen
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Main modal
  // ---------------------------------------------------------------------------
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
            If your spouse has already paid for hotel accommodation, enter their
            pairing code to continue.
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
                const value = e.target.value.replace(/\D/g, "").slice(0, 5);
                setPairingCode(value);
                setVerificationError("");
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
            className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              isVerifying || !pairingCode.trim()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {isVerifying && <Loader2 className="w-4 h-4 animate-spin" />}
            {isVerifying ? "Verifying..." : "Verify Code"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Don&apos;t have a code?
              </span>
            </div>
          </div>

          <button
            onClick={onProceedToPayment}
            disabled={isVerifying}
            className="w-full py-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
}

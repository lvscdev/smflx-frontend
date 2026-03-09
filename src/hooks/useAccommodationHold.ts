"use client";

import { useState, useRef, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AccommodationHoldState = {
  startedAtMs: number | null;
  expiresAtMs: number | null;
  remainingMs: number | null;
  expired: boolean;
};

export interface AccommodationHoldResult {
  accommodationHold: AccommodationHoldState;
  accommodationHoldExpired: boolean;
  accommodationHoldRemainingMs: number | null;
  formatHoldRemaining: (ms: number | null) => string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Tracks the 1-hour hold window for a pending (unpaid) accommodation booking.
 * When the hold expires it calls `onExpire` so the parent can clear the
 * accommodation from state.
 */
export function useAccommodationHold(
  normalizedAccommodation: any,
  paidForAccommodation: boolean,
  onExpire: () => void,
): AccommodationHoldResult {
  const [accommodationHold, setAccommodationHold] = useState<AccommodationHoldState>({
    startedAtMs: null,
    expiresAtMs: null,
    remainingMs: null,
    expired: false,
  });

  // Stable ref so the tick closure doesn't capture a stale callback identity
  const onExpireRef = useRef(onExpire);
  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  useEffect(() => {
    const HOLD_MS = 60 * 60 * 1000;
    const hasPendingAccommodation = !!normalizedAccommodation && !paidForAccommodation;

    if (!hasPendingAccommodation) {
      setAccommodationHold((prev: AccommodationHoldState) => {
        if (
          prev.startedAtMs === null &&
          prev.expiresAtMs === null &&
          prev.remainingMs === null &&
          prev.expired === false
        ) return prev;
        return { startedAtMs: null, expiresAtMs: null, remainingMs: null, expired: false };
      });
      return;
    }

    const getStartedAtMs = (): number | null => {
      const a = normalizedAccommodation as any;
      const apiTs =
        a?.bookingInitiatedAt ?? a?.booking_initiated_at ??
        a?.holdStartedAt ?? a?.hold_started_at ??
        a?.createdAt ?? a?.created_at ?? null;

      if (apiTs) {
        const ms = typeof apiTs === "number" ? apiTs : new Date(apiTs).getTime();
        if (Number.isFinite(ms) && ms > 0) return ms;
      }

      try {
        const raw = localStorage.getItem("smflx_pending_accommodation_payment_started_at");
        const n = raw ? Number(raw) : NaN;
        if (Number.isFinite(n) && n > 0) return n;
      } catch {}

      return null;
    };

    const startedAtMs = getStartedAtMs();
    if (!startedAtMs) {
      setAccommodationHold({ startedAtMs: null, expiresAtMs: null, remainingMs: null, expired: false });
      return;
    }

    const expiresAtMs = startedAtMs + HOLD_MS;
    let handledExpire = false;

    const tick = () => {
      const remainingMs = Math.max(0, expiresAtMs - Date.now());
      const expired = remainingMs <= 0;

      setAccommodationHold((prev: AccommodationHoldState) => {
        if (
          prev.startedAtMs === startedAtMs &&
          prev.expiresAtMs === expiresAtMs &&
          prev.remainingMs === remainingMs &&
          prev.expired === expired
        ) return prev;
        return { startedAtMs, expiresAtMs, remainingMs, expired };
      });

      if (!expired || handledExpire) return;
      handledExpire = true;
      onExpireRef.current();
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [Boolean(normalizedAccommodation), paidForAccommodation]);

  const formatHoldRemaining = (ms: number | null): string => {
    if (ms == null) return "";
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}m ${s}s`;
  };

  return {
    accommodationHold,
    accommodationHoldExpired: accommodationHold.expired,
    accommodationHoldRemainingMs: accommodationHold.remainingMs,
    formatHoldRemaining,
  };
}
"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { getUserDashboard, listMyRegistrations } from "@/lib/api";
import type { DashboardRegistration, DashboardAccommodation } from "@/lib/api/dashboardTypes";
import { safeLoadFlowState, safeSaveFlowState } from "@/lib/constants/flowState";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PostPaymentPollingOptions {
  setRegistration: (r: DashboardRegistration | null) => void;
  setAccommodation: (a: DashboardAccommodation | null) => void;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function consumePostPaymentFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const flag = localStorage.getItem("smflx_post_payment_poll");
    if (flag) {
      localStorage.removeItem("smflx_post_payment_poll");
      return true;
    }
  } catch {}
  return false;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Polls the dashboard API after a payment redirect until the payment is
 * confirmed. Triggered by the `smflx_post_payment_poll` localStorage flag
 * written by the payment callback page.
 *
 * Dispatches `smflx:dependents:refresh` when fresh dependent data is available
 * so Dashboard can update its local state without a full reload.
 */
export function usePostPaymentPolling({
  setRegistration,
  setAccommodation,
}: PostPaymentPollingOptions) {
  const postPaymentPollingRef = useRef(false);

  useEffect(() => {
    if (postPaymentPollingRef.current) return;
    if (typeof window === "undefined") return;

    const isPostPayment = consumePostPaymentFlag();
    const flowState = safeLoadFlowState();
    const justPaid = isPostPayment || flowState?.paymentStatus === "success";

    if (!justPaid) return;

    postPaymentPollingRef.current = true;

    if (flowState?.paymentStatus) {
      safeSaveFlowState({ ...flowState, paymentStatus: undefined });
    }

    const MAX_POLLS = 6;
    const POLL_INTERVAL_MS = 4000;
    let pollCount = 0;
    let cancelled = false;

    const pollDashboard = async () => {
      if (cancelled || pollCount >= MAX_POLLS) return;
      pollCount++;

      try {
        const regs = await listMyRegistrations();
        if (cancelled) return;

        const latest = regs?.[0];
        if (!latest?.eventId) {
          if (pollCount < MAX_POLLS) setTimeout(pollDashboard, POLL_INTERVAL_MS);
          return;
        }

        const eventId = latest.eventId;
        const dashboardData = await getUserDashboard(eventId);
        if (cancelled) return;

        const regForEvent =
          dashboardData.registrations.find((r) => r.eventId === eventId) ??
          dashboardData.registrations[0] ??
          null;

        const accForEvent =
          dashboardData.accommodations.find((a) => a.eventId === eventId) ??
          dashboardData.accommodations[0] ??
          null;

        // Determine if accommodation payment confirmed
        const accStatus = String(
          (accForEvent as any)?.status ??
          (accForEvent as any)?.paymentStatus ??
          ""
        ).toLowerCase();
        const accPaid =
          (accForEvent as any)?.paidForAccommodation === true ||
          ["paid", "success", "completed", "confirmed"].includes(accStatus);

        // Determine if registration payment confirmed
        const regStatus = String(
          (regForEvent as any)?.status ??
          (regForEvent as any)?.paymentStatus ??
          (regForEvent as any)?.payment_status ??
          ""
        ).toUpperCase();
        const regPaid = ["PAID", "SUCCESS", "COMPLETED", "CONFIRMED", "ACTIVE"].includes(regStatus);

        const isPaid = accPaid || regPaid;

        if (regForEvent) {
          if (isPaid && accForEvent) {
            const currentType = String(
              (regForEvent as any)?.attendeeType ??
              (regForEvent as any)?.attendanceType ??
              (regForEvent as any)?.participationMode ??
              ""
            ).toLowerCase();

            const isNonCamper =
              currentType === "physical" ||
              currentType === "online" ||
              currentType === "attendee" ||
              currentType === "";

            setRegistration(isNonCamper
              ? { ...regForEvent, attendeeType: "camper", attendanceType: "camper", participationMode: "CAMPER" }
              : regForEvent
            );
          } else {
            setRegistration(regForEvent);
          }
        }

        if (accForEvent) setAccommodation(accForEvent);

        // Dispatch fresh dependents to Dashboard's local state listener
        if (dashboardData.dependents && dashboardData.dependents.length > 0) {
          const freshDependents = dashboardData.dependents.map((d: any) => {
            const id = d.id ?? d.dependantId ?? d.dependentId ?? "";
            const paymentStatusRaw = (d.paymentStatus ?? d.payment_state ?? d.paymentState ?? d.status ?? "").toUpperCase();
            const paid =
              d.isPaid === true ||
              d.paid === true ||
              ["PAID", "SUCCESS", "COMPLETED", "CONFIRMED"].includes(paymentStatusRaw);
            return {
              id,
              name: d.name ?? d.dependantName ?? d.dependentName ?? "Dependent",
              age: String(d.age ?? d.dependantAge ?? d.dependentAge ?? ""),
              gender: d.gender ?? d.dependantGender ?? "",
              isRegistered: typeof d.isRegistered === "boolean" ? d.isRegistered : true,
              isPaid: paid,
            };
          });
          try {
            window.dispatchEvent(new CustomEvent("smflx:dependents:refresh", { detail: freshDependents }));
          } catch {}
        }

        if (isPaid || pollCount >= MAX_POLLS) {
          if (!isPaid && pollCount >= MAX_POLLS) {
            toast.warning("Payment is still being confirmed", {
              description: "Your payment was received but is still processing. Please refresh in a few minutes.",
              duration: 10000,
              action: { label: "Refresh now", onClick: () => window.location.reload() },
            });
          }
          return;
        }

        setTimeout(pollDashboard, POLL_INTERVAL_MS);
      } catch {
        if (!cancelled && pollCount < MAX_POLLS) {
          setTimeout(pollDashboard, POLL_INTERVAL_MS);
        }
      }
    };

    const startTimer = setTimeout(pollDashboard, 3000);
    return () => {
      cancelled = true;
      clearTimeout(startTimer);
    };
  }, []);
}
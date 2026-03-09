/** localStorage key for the SMFLX wizard flow state (v1). */
export const FLOW_STATE_KEY = "smflx_flow_state_v1";

/**
 * Keys that were used in old versions of the app and should be purged on boot
 * to prevent stale data from affecting the current session.
 */
export const LEGACY_KEYS = [
  "smflx_flow_state",
  "flowState",
  "smflx_last_state",
  "smflx_selected_event",
  "smflx_pending_accommodation_payment",
  "smflx_pending_accommodation_payment_started_at",
  "smflx_pending_dependents_v1",
  "smflx_pending_payment_ctx",
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function cleanLegacyKeys() {
  if (typeof window === "undefined") return;
  try {
    for (const key of LEGACY_KEYS) localStorage.removeItem(key);
  } catch {}
}

export function safeLoadFlowState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(FLOW_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function safeSaveFlowState(state: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FLOW_STATE_KEY, JSON.stringify(state));
  } catch {}
}

export function safeClearFlowState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(FLOW_STATE_KEY);
    cleanLegacyKeys();
  } catch {}
}
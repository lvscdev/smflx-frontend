import type { NormalizedDashboardResponse, UserProfile, DashboardRegistration, DashboardAccommodation, DashboardDependent, PaymentSummary } from "../api/dashboardTypes";

const DASHBOARD_SNAPSHOT_KEY = "smflx_dashboard_snapshot_v1";
const MS_7_DAYS = 7 * 24 * 60 * 60 * 1000;

export interface DashboardSnapshot {
  savedAt: number;
  activeEventId?: string;
  profile: UserProfile | null;
  events: Record<
    string,
    {
      registrations: DashboardRegistration[];
      accommodations: DashboardAccommodation[];
      dependents: DashboardDependent[];
      paymentSummary?: PaymentSummary | null;
    }
  >;
}

export function saveDashboardSnapshot(
  activeEventId: string | undefined,
  profile: UserProfile | null,
  eventData: NormalizedDashboardResponse | null,
): void {
  if (typeof window === "undefined") return;

  try {
    const existing = loadDashboardSnapshot() ?? {
      savedAt: Date.now(),
      activeEventId,
      profile,
      events: {},
    };

    const next: DashboardSnapshot = {
      savedAt: Date.now(),
      activeEventId: activeEventId ?? existing.activeEventId,
      profile: profile ?? existing.profile,
      events: { ...existing.events },
    };

    if (eventData) {
      next.events[eventData.eventId] = {
        registrations: eventData.registrations,
        accommodations: eventData.accommodations,
        dependents: eventData.dependents,
        paymentSummary: eventData.paymentSummary ?? null,
      };
    }

    localStorage.setItem(DASHBOARD_SNAPSHOT_KEY, JSON.stringify(next));
  } catch {
    // ignore storage failures
  }
}

export function loadDashboardSnapshot(): DashboardSnapshot | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(DASHBOARD_SNAPSHOT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;

    const snap = parsed as Partial<DashboardSnapshot>;
    if (typeof snap.savedAt !== "number") return null;

    if (Date.now() - snap.savedAt > MS_7_DAYS) {
      clearDashboardSnapshot();
      return null;
    }

    return snap as DashboardSnapshot;
  } catch {
    return null;
  }
}

export function clearDashboardSnapshot(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(DASHBOARD_SNAPSHOT_KEY);
  } catch {
    // ignore
  }
}
